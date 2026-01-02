import { uni } from 'delta-comic-core'
import Database from '@tauri-apps/plugin-sql'
import mitt from 'mitt'

export interface SaveItem {
  key: string
  item: string // `uni.item.RawItem` to stringified JSON
}
export type SaveItem_ = SaveItem | uni.item.RawItem | uni.item.Item

const _db = await Database.load('app.db')
export namespace AppDB {
  export const db = _db

  export async function init() {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS items (
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

  export async function upsertItem(item: SaveItem_) {
    if ('key' in item) var svi = item
    else if (uni.item.Item.is(item)) var svi = { key: item.id, item: JSON.stringify(item.toJSON()) }
    else var svi = { key: item.id, item: JSON.stringify(item) }
    await db.execute(`
      INSERT INTO items (key, item) VALUES ($1, $2)
      ON CONFLICT(key) DO UPDATE SET item=excluded.item
    `, [svi.key, svi.item])
    emitter.emit('change')
  }

  export async function getItem(key: string): Promise<uni.item.Item | undefined> {
    const result = await db.select<SaveItem[]>(`
      SELECT key, item FROM items WHERE key = $1
    `, [key])
    return result.length > 0 ? uni.item.Item.create(JSON.parse(result[0].item)) : undefined
  }

  export async function getByQuery(query: string, params: any[] = []): Promise<uni.item.Item[]> {
    const result = await db.select<SaveItem[]>(`
      SELECT key, item FROM items WHERE ${query}
    `, params)
    return result.map(r => uni.item.Item.create(JSON.parse(r.item)))
  }
}