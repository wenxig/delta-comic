import { appLocalDataDir } from '@tauri-apps/api/path'
const appLocalDataDirPath = await appLocalDataDir()
export const getPluginFsPath = (pluginName: string) => `${appLocalDataDirPath}/plugin/${pluginName}`