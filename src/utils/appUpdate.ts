import { Octokit } from "@octokit/rest"
import { enc } from "crypto-js"
import { Utils } from "delta-comic-core"
import { download } from '@tauri-apps/plugin-upload'
const LATEST_SYMBOL_WORD = enc.Base64.parse('<APK>').toString()
const LATEST_FILE_NAME = 'latest.txt'


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
    const apkResult = await download({
      path: apkInfo.uri,
      url: apkUrl,
      progress: true
    })
    if (!apkResult.path) throw new Error('fail to download apk')
    return apkResult.path!
  })

  await createLoading('安装', async c => {
    c.retryable = true
    await FileOpener.open({
      filePath: apkResult
    })
  })
})