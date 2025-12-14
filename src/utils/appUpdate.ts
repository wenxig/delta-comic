import { Octokit } from "@octokit/rest"
import { Filesystem as fs, Directory } from '@capacitor/filesystem'
import { FileTransfer } from '@capacitor/file-transfer'
import { loadAsync, type JSZipObject } from 'jszip'
import { isBlob, isUndefined } from 'es-toolkit'
import { FileOpener } from '@capacitor-community/file-opener'
import { Capacitor, WebView } from "@capacitor/core"
import { useLocalStorage } from "@vueuse/core"
import axios from "axios"
import { enc } from "crypto-js"
import { Utils } from "delta-comic-core"

const LATEST_SYMBOL_WORD = enc.Base64.parse('<APK>').toString()
const LATEST_FILE_NAME = 'latest.txt'

const appDir = Directory.Cache

export const updateByApk = () => Utils.message.createDownloadMessage('通过APK更新中', async ({ createLoading, createProgress }) => {
  // if (!Capacitor.isNativePlatform()) throw new Error('not native platform')
  const octokit = new Octokit
  const { apkUrl, repo } = await createLoading('获取仓库信息', async c => {
    c.retryable = true
    c.description = '请求中'
    const { data: repo } = await octokit.rest.repos.getLatestRelease({
      owner: 'wenxig',
      repo: 'delta-comic'
    })
    c.description = '解析中'
    const apkUrl = repo.assets.find(v => v.name == 'app.apk')?.browser_download_url
    if (!apkUrl) throw new Error('could not find apk in github')
    c.description = `最新Tag: ${repo.tag_name}`
    return { apkUrl, repo }
  })

  const apkInfo = await createLoading('创建文件系统', async c => {
    c.retryable = true
    c.description = '生成uri'
    const apkInfo = await fs.getUri({
      directory: appDir,
      path: `${repo.tag_name}.apk`,
    })
    c.description = '清理旧文件'
    try {
      await fs.deleteFile({ path: apkInfo.uri })
      await fs.writeFile({
        path: apkInfo.uri,
        data: '',
        recursive: true
      })
      await fs.deleteFile({ path: apkInfo.uri })
    } catch (err) { console.warn(err) }
    c.description = `URI: ${apkInfo}`
    return apkInfo
  })
  const apkResult = await createProgress('下载APK', async c => {
    c.retryable = true
    c.description = '下载中'
    await FileTransfer.addListener('progress', p => {
      if (!p.lengthComputable) c.progress = 100
      else c.progress = Math.round(p.bytes / p.contentLength * 100)
    })
    const apkResult = await FileTransfer.downloadFile({
      path: apkInfo.uri,
      url: apkUrl,
      progress: true
    })
    if (!apkResult.path) throw new Error('fail to download apk')
    c.description = '更新记录文件'
    await fs.writeFile({
      directory: appDir,
      path: LATEST_FILE_NAME,
      data: LATEST_SYMBOL_WORD
    })
    return apkResult.path!
  })

  await createLoading('安装', async c => {
    c.retryable = true
    await FileOpener.open({
      filePath: apkResult
    })
  })
})


export const updateByHot = () => Utils.message.createDownloadMessage('通过热更新更新中', async ({ createLoading, createProgress }) => {
  // if (!Capacitor.isNativePlatform()) throw new Error('not native platform')

  const octokit = new Octokit
  const { zipUrl, repo } = await createLoading('获取仓库信息', async c => {
    c.retryable = true
    c.description = '请求中'
    const { data: repo } = await octokit.rest.repos.getLatestRelease({
      owner: 'wenxig',
      repo: 'delta-comic'
    })
    const zipUrl = repo.assets.find(v => v.name == 'dist.zip')?.browser_download_url
    if (!zipUrl) throw new Error('could not find zip in github')
    return { zipUrl, repo }
  })
  const { files } = await createProgress('下载归档', async c => {
    c.retryable = true
    c.description = '下载中'
    const { data: zipBlob } = await axios.get<Blob>(zipUrl, {
      responseType: 'blob',
      onDownloadProgress(progress) {
        if (!progress.lengthComputable || isUndefined(progress.total)) c.progress = 100
        else c.progress = Math.round(progress.loaded / progress.total! * 100)
      },
    })
    c.description = '解析中'
    const zip = await loadAsync(zipBlob)

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
    return { zip, files }
  })
  await createProgress('写入文件中', async c => {
    c.retryable = true
    c.description = '清理中'
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

    c.description = '写入中'
    // 并发会引发神秘的 "文件夹已经存在" bug
    let index = -1
    for (const { file, path } of files) {
      index++
      await fs.writeFile({
        path: `${repo.tag_name}/${path}`,
        directory: appDir,
        recursive: true,
        data: await file.async('base64')
      })
      c.progress = Math.ceil(index / files.length * 100)
    }
    console.log('write file done')
    c.description = '更新记录文件'
    await fs.writeFile({
      directory: appDir,
      path: LATEST_FILE_NAME,
      data: enc.Base64.stringify(enc.Utf8.parse(repo.tag_name))
    })
  })

  location.reload()
})

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
  } catch (err) {
    console.error(err)
  }
  location.reload()
}
window.$api.fs = fs
window.$api.WebView = WebView