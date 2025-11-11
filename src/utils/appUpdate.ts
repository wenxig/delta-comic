import { Octokit } from "@octokit/rest"
import { Filesystem as fs, Directory } from '@capacitor/filesystem'
import { FileTransfer } from '@capacitor/file-transfer'
import { AppInstallPlugin } from '@m430/capacitor-app-install'
import { loadAsync, type JSZipObject } from 'jszip'
import { isBlob, isString, Semaphore } from 'es-toolkit'
import { App } from "@capacitor/app"
import { Capacitor, WebView } from "@capacitor/core"
import { useLocalStorage } from "@vueuse/core"
import axios from "axios"
import { enc } from "crypto-js"

const LATEST_SYMBOL_WORD = enc.Base64.parse('<APK>').toString()
const LATEST_FILE_NAME = 'latest.txt'

const appDir = Directory.Cache

export const updateByApk = async () => {
  // if (!Capacitor.isNativePlatform()) throw new Error('not native platform')

  const octokit = new Octokit
  const { data: repo } = await octokit.rest.repos.getLatestRelease({
    owner: 'wenxig',
    repo: 'delta-comic'
  })
  const apkUrl = repo.assets.find(v => v.name == 'app.apk')?.browser_download_url
  if (!apkUrl) throw new Error('could not find apk in github')
  const apkInfo = await fs.getUri({
    directory: appDir,
    path: `${repo.tag_name}.apk`,
  })
  try {
    await fs.deleteFile({ path: apkInfo.uri })
    await fs.writeFile({
      path: apkInfo.uri,
      data: '',
      recursive: true
    })
    await fs.deleteFile({ path: apkInfo.uri })
  } catch (err) { console.warn(err) }
  console.log('downloading')
  const apkResult = await FileTransfer.downloadFile({
    path: apkInfo.uri,
    url: apkUrl
  })
  if (!apkResult.path) throw new Error('fail to download apk')
  // Check if app can install unknown apps
  const { granted } = await AppInstallPlugin.canInstallUnknownApps()
  if (!granted) {
    const { promise, ...controller } = Promise.withResolvers<void>()
    window.$dialog.warning({
      title: '应用更新',
      content: '您似乎没有开启安装未知应用权限，这可能影响应用更新\n如果您不启用权限，下次安装时仍会提出警告',
      positiveText: '去开启',
      async onPositiveClick() {
        // Open settings to allow install from unknown sources
        try {
          await AppInstallPlugin.openInstallUnknownAppsSettings()
          controller.resolve()
        } catch (error) {
          controller.reject(error)
        }
      },
      negativeText: '算了',
      onNegativeClick() {
        controller.resolve()
      },
    })
    await promise
  }
  try {
    const result = await AppInstallPlugin.installApk({
      filePath: apkInfo.uri
    })
    console.log('Installation result:', result.message)
    if (result.completed) {
      console.log('APK installation started successfully')
    }
  } catch (error) {
    console.error('Failed to install APK:', error)
  }
  await fs.deleteFile({
    path: apkInfo.uri
  })

  await fs.writeFile({
    directory: appDir,
    path: LATEST_FILE_NAME,
    data: LATEST_SYMBOL_WORD
  })

  // App.exitApp()
}


export const updateByHot = async () => {
  // if (!Capacitor.isNativePlatform()) throw new Error('not native platform')

  const octokit = new Octokit
  const { data: repo } = await octokit.rest.repos.getLatestRelease({
    owner: 'wenxig',
    repo: 'delta-comic'
  })
  const zipUrl = repo.assets.find(v => v.name == 'dist.zip')?.browser_download_url
  if (!zipUrl) throw new Error('could not find zip in github')

  const { data: zipBlob } = await axios.get<Blob>(zipUrl, { responseType: 'blob' })
  const zip = await loadAsync(zipBlob)

  try {
    await fs.rmdir({
      directory: appDir,
      path: repo.tag_name,
      recursive: true,
    })
  } catch { }
  await fs.mkdir({
    path: repo.tag_name,
    directory: appDir,
    recursive: true
  })

  const files = new Array<{
    path: string
    file: JSZipObject
  }>()
  zip.forEach((zipFilePath, file) => {
    if (file.dir) return
    files.push({
      path: zipFilePath,
      file
    })
  })

  // 并发会引发神秘的 "文件夹已经存在" bug
  for (const { file, path } of files) {
    await fs.writeFile({
      path: `${repo.tag_name}/${path}`,
      directory: appDir,
      recursive: true,
      data: await file.async('base64')
    })
  }
  console.log('write file done')
  await fs.writeFile({
    directory: appDir,
    path: LATEST_FILE_NAME,
    data: enc.Base64.stringify(enc.Utf8.parse(repo.tag_name))
  })

  location.reload()
}

// const blobToDataurl = (blob: Blob) => {
//   const { promise, reject, resolve } = Promise.withResolvers<string>()
//   const reader = new FileReader()
//   reader.onloadend = () => {
//     const res = reader.result?.toString()
//     if (!res) return reject(new Error('can`t translate blob'))
//     resolve(res.split(',')[1])
//   }
//   reader.onerror = reject
//   reader.readAsDataURL(blob)
//   return promise
// }

const BASE_WEBVIEW_PATH_KEY = 'BASE_WEBVIEW_PATH_KEY'
export const bootApp = async () => {
  if (!Capacitor.isNativePlatform()) return

  const webviewNowPath = (await WebView.getServerBasePath()).path
  const baseWebViewPath = useLocalStorage(BASE_WEBVIEW_PATH_KEY, webviewNowPath) // 第一次启动时会记录默认路径

  let serverPath = LATEST_SYMBOL_WORD
  try {
    const file = await fs.readFile({
      directory: appDir,
      path: LATEST_FILE_NAME
    })
    serverPath = isBlob(file.data) ? await file.data.text() : file.data
    serverPath = serverPath.trim()
  } catch { }

  if (serverPath == LATEST_SYMBOL_WORD) { // 如果使用默认路径
    if (webviewNowPath == baseWebViewPath.value) return // 且base相同就跳过
    await setWebViewServerBasePath(baseWebViewPath.value)
  }

  serverPath = enc.Utf8.stringify(enc.Base64.parse(serverPath))

  const { uri } = await fs.stat({
    directory: appDir,
    path: `${serverPath}/index.html`
  })
  const newPath = uri.replace(/^file:\/\//, '').replace(/\/index\.html$/, '') // 读取可以作为base的路径

  if (webviewNowPath == newPath) return // 现在和最新的路径一样就跳过
  await setWebViewServerBasePath(newPath)
}

const setWebViewServerBasePath = async (path: string) => {
  await WebView.setServerBasePath({
    path
  })
  try {
    await WebView.persistServerBasePath()
  } catch { }
  location.reload()
}
window.$api.fs = fs
window.$api.WebView = WebView