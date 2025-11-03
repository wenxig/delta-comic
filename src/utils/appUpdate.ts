import { Octokit } from "@octokit/rest"
import { Filesystem as fs, Directory } from '@capacitor/filesystem'
import { FileTransfer } from '@capacitor/file-transfer'
import { AppInstallPlugin } from '@m430/capacitor-app-install'
import { } from 'jszip'
export const updateByApk = async () => {
  const octokit = new Octokit
  const { data: repo } = await octokit.rest.repos.getLatestRelease({
    owner: 'wenxig',
    repo: 'delta-comic'
  })
  const apkUrl = repo.assets.find(v => v.name == 'app.apk')?.browser_download_url
  if (!apkUrl) throw new Error('could not find apk in github')
  const apkResult = await FileTransfer.downloadFile({
    path: Directory.Cache,
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
      filePath: apkResult.path
    })
    console.log('Installation result:', result.message)
    if (result.completed) {
      console.log('APK installation started successfully')
    }
  } catch (error) {
    console.error('Failed to install APK:', error)
  }
  await fs.deleteFile({
    path: apkResult.path
  })
}


export const updateByHot = async () => {
  const octokit = new Octokit
  const { data: repo } = await octokit.rest.repos.getLatestRelease({
    owner: 'wenxig',
    repo: 'delta-comic'
  })
  const zipUrl = repo.assets.find(v => v.name == 'dist.zip')?.browser_download_url
  if (!zipUrl) throw new Error('could not find zip in github')
  const zipResult = await FileTransfer.downloadFile({
    path: Directory.Cache,
    url: zipUrl
  })
  if (!zipResult.path) throw new Error('fail to download zip')

  await fs.deleteFile({
    path: zipResult.path
  })
}