import { Octokit } from "@octokit/rest"
import { Filesystem as fs, Directory } from '@capacitor/filesystem'
import { FileTransfer } from '@capacitor/file-transfer'
import { AppInstallPlugin } from '@m430/capacitor-app-install'
import { loadAsync, type JSZipObject } from 'jszip'
import { isBlob, Semaphore } from 'es-toolkit'
import { App } from "@capacitor/app"
import { Capacitor, WebView } from "@capacitor/core"
import { useLocalStorage } from "@vueuse/core"

const LATEST_SYMBOL_WORD = '<APK>'
const LATEST_FILE_NAME = 'latest.txt'

export const updateByApk = async () => {
  if (!Capacitor.isNativePlatform()) throw new Error('not native platform')

  const octokit = new Octokit
  const { data: repo } = await octokit.rest.repos.getLatestRelease({
    owner: 'wenxig',
    repo: 'delta-comic'
  })
  const apkUrl = repo.assets.find(v => v.name == 'app.apk')?.browser_download_url
  if (!apkUrl) throw new Error('could not find apk in github')
  const apkInfo = await fs.getUri({
    directory: Directory.Cache,
    path: `${repo.tag_name}.apk`
  })
  try {
    await fs.deleteFile({ path: apkInfo.uri })
  } catch { }
  const apkResult = await FileTransfer.downloadFile({
    path: apkInfo.uri,
    url: apkUrl
  })
  if (!apkResult.path) throw new Error('fail to download apk')
  // Check if app can install unknown apps
  const { granted } = await AppInstallPlugin.canInstallUnknownApps()
  if (!granted) {
    try {
      await window.$dialog.warning({
        title: '应用更新',
        content: '您似乎没有开启安装未知应用权限，这可能影响应用更新\n如果您不启用权限，下次安装时仍会提出警告',
        positiveText: '去开启',
        onPositiveClick() {
          // Open settings to allow install from unknown sources
          return AppInstallPlugin.openInstallUnknownAppsSettings()
        },
        negativeText: '算了'
      })
    } catch { }
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
    directory: Directory.Cache,
    path: LATEST_FILE_NAME,
    data: LATEST_SYMBOL_WORD
  })

  App.exitApp()
}


export const updateByHot = async () => {
  if (!Capacitor.isNativePlatform()) throw new Error('not native platform')

  const octokit = new Octokit
  const { data: repo } = await octokit.rest.repos.getLatestRelease({
    owner: 'wenxig',
    repo: 'delta-comic'
  })
  const zipUrl = repo.assets.find(v => v.name == 'dist.zip')?.browser_download_url
  if (!zipUrl) throw new Error('could not find zip in github')
  const zipInfo = await fs.getUri({
    directory: Directory.Cache,
    path: `${repo.tag_name}.zip`
  })
  const zipResult = await FileTransfer.downloadFile({
    path: zipInfo.uri,
    url: zipUrl
  })
  if (!zipResult.blob) throw new Error('fail to download zip')

  const zip = await loadAsync(zipResult.blob)

  try {
    await fs.rmdir({
      directory: Directory.Cache,
      path: repo.tag_name,
      recursive: true,
    })
  } catch { }
  await fs.mkdir({
    path: repo.tag_name,
    directory: Directory.Cache,
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

  const speedLimit = new Semaphore(5)
  await Promise.all(files.map(async ({ file, path }) => {
    await speedLimit.acquire()
    await fs.writeFile({
      path: `${repo.tag_name}/${path}`,
      directory: Directory.Cache,
      recursive: true,
      data: await file.async('blob')
    })
    speedLimit.release()
  }))

  await fs.writeFile({
    directory: Directory.Cache,
    path: LATEST_FILE_NAME,
    data: repo.tag_name
  })

  location.reload()
}
const BASE_WEBVIEW_PATH_KEY = 'BASE_WEBVIEW_PATH_KEY'
export const bootApp = async () => {
  if (!Capacitor.isNativePlatform()) return

  const webviewNowPath = (await WebView.getServerBasePath()).path
  const baseWebViewPath = useLocalStorage(BASE_WEBVIEW_PATH_KEY, webviewNowPath) // 第一次启动时会记录默认路径

  let serverPath = LATEST_SYMBOL_WORD
  try {
    const file = await fs.readFile({
      directory: Directory.Cache,
      path: LATEST_FILE_NAME
    })
    serverPath = isBlob(file.data) ? await file.data.text() : file.data
    serverPath = serverPath.trim()
  } catch { }

  if (serverPath == LATEST_SYMBOL_WORD) { // 如果使用默认路径
    if (webviewNowPath == baseWebViewPath.value) return // 且base相同就跳过
    await setWebViewServerBasePath(baseWebViewPath.value)
  }

  const { uri } = await fs.stat({
    directory: Directory.Cache,
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