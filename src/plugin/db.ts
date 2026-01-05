import Database from '@tauri-apps/plugin-sql'
import type { PluginMeta } from 'delta-comic-core'
import mitt from 'mitt'

export interface PluginArchiveMeta {
  installerName: string
  loaderName: string
  pluginName: string
  meta: PluginMeta
  enable: boolean
  installInput: string
}
export interface RawPluginArchiveMeta {
  pluginName: string // PRIMARY KEY
  installerName: string
  loaderName: string
  meta: string
  enable: number
  installInput: string
}

const _db = await Database.load('plugin.db')
export namespace PluginArchiveMetaDB {
  export const db = _db

  export async function init() {
    // type `PluginMeta`
    await db.execute(`
      CREATE TABLE IF NOT EXISTS plugin_meta (
        pluginName TEXT PRIMARY KEY,
        installerName TEXT NOT NULL,
        loaderName TEXT NOT NULL,
        meta TEXT NOT NULL,
        enable INTEGER NOT NULL,
        installInput TEXT NOT NULL
      )
    `)
  }

  const emitter = mitt<{
    change: void
  }>()
  export function onChange(cb: () => void) {
    emitter.on('change', cb)
    return () => emitter.off('change', cb)
  }

  export async function upsert(meta: PluginArchiveMeta) {
    await db.execute(
      `INSERT INTO plugin_meta (pluginName, installerName, loaderName, meta, enable, installInput) VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT(pluginName) DO UPDATE SET
         installerName=excluded.installerName, loaderName=excluded.loaderName, meta=excluded.meta, enable=excluded.enable, installInput=excluded.installInput
      `,
      [
        meta.pluginName,
        meta.installerName,
        meta.loaderName,
        JSON.stringify(meta.meta),
        meta.enable ? 1 : 0,
        meta.installInput
      ]
    )
    emitter.emit('change')
  }
  export async function getAll(): Promise<PluginArchiveMeta[]> {
    const result = await db.select<RawPluginArchiveMeta[]>(`
      SELECT pluginName, installerName, loaderName, meta, enable, installInput FROM plugin_meta 
    `)
    return result.map(r => ({
      pluginName: r.pluginName,
      installerName: r.installerName,
      loaderName: r.loaderName,
      meta: JSON.parse(r.meta),
      enable: r.enable === 1,
      installInput: r.installInput
    }))
  }
  export async function get(pluginName: string): Promise<PluginArchiveMeta | undefined> {
    const result = await db.select<RawPluginArchiveMeta[]>(`
      SELECT pluginName, installerName, loaderName, meta, enable, installInput FROM plugin_meta WHERE pluginName = $1
    `, [pluginName])
    if (result.length === 0) return undefined
    const r = result[0]
    return {
      pluginName: r.pluginName,
      installerName: r.installerName,
      loaderName: r.loaderName,
      meta: JSON.parse(r.meta),
      enable: r.enable === 1,
      installInput: r.installInput
    }
  }

  export async function remove(pluginName: string) {
    await db.execute(`
      DELETE FROM plugin_meta WHERE pluginName = $1
    `, [pluginName])
    emitter.emit('change')
  }

  export async function setEnable(pluginName: string, enable: boolean) {
    await db.execute(`
      UPDATE plugin_meta SET enable = $1 WHERE pluginName = $2
    `, [enable ? 1 : 0, pluginName])
    emitter.emit('change')
  }

  // 反转enable然后返回enable
  export async function toggleEnable(pluginName: string): Promise<boolean> {
    const meta = await get(pluginName)
    if (!meta) throw new Error(`plugin not found: ${pluginName}`)
    const newEnable = !meta.enable
    await setEnable(pluginName, newEnable)
    return newEnable
  }

  export async function getByEnabled (enable: boolean): Promise<PluginArchiveMeta[]> {
    const result = await db.select<RawPluginArchiveMeta[]>(`
      SELECT pluginName, installerName, loaderName, meta, enable, installInput FROM plugin_meta WHERE enable = $1
    `, [enable ? 1 : 0])
    return result.map(r => ({
      pluginName: r.pluginName,
      installerName: r.installerName,
      loaderName: r.loaderName,
      meta: JSON.parse(r.meta),
      enable: r.enable === 1,
      installInput: r.installInput
    }))
  }

  export async function count(): Promise<number> {
    const result = await db.select<{ count: number }[]>(`
      SELECT COUNT(*) as count FROM plugin_meta
    `)
    return result[0]?.count || 0
  }
}