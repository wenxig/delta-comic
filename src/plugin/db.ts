import Database from '@tauri-apps/plugin-sql'
import mitt from 'mitt'

export interface RawDBPluginMeta {
  isEnable: number
}

const _db = await Database.load('plugin.db')
export namespace AppDB {
  export const db = _db

  export async function init() {
    // type `PluginMeta`
    await db.execute(`
      CREATE TABLE IF NOT EXISTS plugin_meta (
        key TEXT PRIMARY KEY,
        item TEXT NOT NULL
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

}