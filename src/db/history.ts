import { uni } from "delta-comic-core"
import { AppDB } from "./app"
import mitt from "mitt"
export interface RawHistoryItem {
  timestamp: number
  item: string
  ep: string // `uni.ep.RawEp` to json string
}
export interface RawHistoryItemJoined {
  timestamp: number
  item: string
  data: string // `uni.item.RawItem` from AppDB
  ep: string // `uni.ep.RawEp` to json string
}
export interface HistoryItem {
  timestamp: number
  item: uni.item.Item
  ep: uni.ep.Ep
}

export namespace HistoryDB {
  const db = AppDB.db

  export async function init() {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS history (
        timestamp INTEGER PRIMARY KEY,
        item TEXT NOT NULL,
        ep TEXT NOT NULL
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

  export async function upsertItem(item: uni.item.Item, ep: uni.ep.Ep) {
    const svi = { key: item.id, item: JSON.stringify(item.toJSON()) }
    await db.execute(`
        INSERT INTO items (key, item) VALUES ($1, $2)
        ON CONFLICT(key) DO UPDATE SET item=excluded.item
      `, [svi.key, svi.item])

    await db.execute(`
      INSERT INTO history (timestamp, item, ep) VALUES ($1, $2, $3)
      ON CONFLICT(timestamp) DO UPDATE SET item=excluded.item, ep=excluded.ep
    `, [Date.now(), JSON.stringify(item.toJSON()), JSON.stringify(ep.toJSON())])
    emitter.emit('change')
  }

  export async function getAll(): Promise<{ item: uni.item.Item; ep: uni.ep.Ep; timestamp: number }[]> {
    const result = await db.select<RawHistoryItemJoined[]>(`
      SELECT h.timestamp, h.item, h.ep, a.item AS data
      FROM history h
      JOIN items a ON h.item = a.key
      ORDER BY h.timestamp DESC
    `)
    return result.map(r => ({
      timestamp: r.timestamp,
      item: uni.item.Item.create(JSON.parse(r.data)),
      ep: new uni.ep.Ep(JSON.parse(r.ep))
    }))
  }

  export async function getBySearch(query: string) {
    const result = await db.select<RawHistoryItemJoined[]>(`
      SELECT h.timestamp, h.item, h.ep, a.item AS data
      FROM history h
      JOIN items a ON h.item = a.key
      WHERE a.item LIKE $1
      ORDER BY h.timestamp DESC
    `, [`%${query}%`])
    return result.map(r => ({
      timestamp: r.timestamp,
      item: uni.item.Item.create(JSON.parse(r.data)),
      ep: new uni.ep.Ep(JSON.parse(r.ep))
    }))
  }

  export async function clear() {
    await db.execute(`DELETE FROM history`)
    emitter.emit('change')
  }
}

await HistoryDB.init()