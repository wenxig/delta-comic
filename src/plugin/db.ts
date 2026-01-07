import type { PluginMeta } from 'delta-comic-core'
import {
  Generated,
  JSONColumnType,
  Selectable,
} from 'kysely'

export interface PluginArchiveMetaTable {
  id: Generated<number>
  installerName: string
  loaderName: string
  pluginName: string
  meta: JSONColumnType<PluginMeta>
  enable: boolean
  installInput: string
}
export type PluginArchiveMeta = Selectable<PluginArchiveMetaTable>