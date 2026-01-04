import { uni, } from "delta-comic-core"
import { AppDB } from "./app"
import mitt from "mitt"
export interface RawRecentViewItem {
  timestamp: number
  itemKey: string
  isViewed: number
}
export interface RawRecentViewItemJoined {
  timestamp: number
  itemKey: string
  isViewed: number
  data: string // `uni.item.RawItem` from AppDB
}
export interface RecentViewItem {
  timestamp: number
  itemKey: string
  item: uni.item.Item
  isViewed: boolean
}

export namespace RecentViewDB {
  const db = AppDB.db

  export async function init() {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS recent_view_items (
        timestamp INTEGER PRIMARY KEY,
        itemKey TEXT NOT NULL,
        isViewed INTEGER NOT NULL
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
  AppDB.onChange(() => emitter.emit('change'))

  export async function upsertItem(item: uni.item.Item, isViewed: boolean) {
    await AppDB.upsertItem(item)
    await db.execute(`
      INSERT INTO recent_view_items (timestamp, itemKey, isViewed) VALUES ($1, $2, $3)
      ON CONFLICT(timestamp) DO UPDATE SET itemKey=excluded.itemKey, isViewed=excluded.isViewed
    `, [Date.now(), item.id, isViewed ? 1 : 0])
    emitter.emit('change')
  }
  export async function getAll(onlyNotViewed = false): Promise<RecentViewItem[]> {
    const result = await db.select<RawRecentViewItemJoined[]>(`
      SELECT r.timestamp, r.itemKey, r.isViewed, a.item AS data
      FROM recent_view_items r
      JOIN items a ON r.itemKey = a.key
      ORDER BY r.timestamp DESC
      WHERE ${onlyNotViewed ? 'r.isViewed = 0' : '1=1'}
    `)
    return result.map(r => ({
      timestamp: r.timestamp,
      itemKey: r.itemKey,
      item: uni.item.Item.create(JSON.parse(r.data)),
      isViewed: r.isViewed === 1
    }))
  }

  export async function remove(timestamp: number) {
    await db.execute(`
      DELETE FROM recent_view_items WHERE timestamp = $1
    `, [timestamp])
    emitter.emit('change')
  }
  export async function clear() {
    await db.execute(`
      DELETE FROM recent_view_items
    `)
    emitter.emit('change')
  }
}

await RecentViewDB.init()