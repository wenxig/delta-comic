import { appLocalDataDir } from '@tauri-apps/api/path'
import type { PluginArchiveDB } from '../db'
import type { PluginConfig } from 'delta-comic-core'
const appLocalDataDirPath = await appLocalDataDir()
export const getPluginFsPath = (pluginName: string) => `${appLocalDataDirPath}/plugin/${pluginName}`


export abstract class PluginInstaller {
  public abstract install(input: string): Promise<PluginArchiveDB.Meta>
  public abstract update(pluginMeta: PluginArchiveDB.Meta): Promise<PluginArchiveDB.Meta>
  public abstract isMatched(input: string): boolean
  public abstract name: string
}

export abstract class PluginLoader {
  public abstract load(pluginMeta: PluginArchiveDB.Meta): Promise<any>
}


export type PluginBooterSetMeta = (meta: Partial<{
  description: string
  name: string
}> | string) => void

export abstract class PluginBooter {
  public abstract name: string
  public abstract call(cfg: PluginConfig, setMeta: PluginBooterSetMeta, env: Record<any, any>): Promise<any>
}