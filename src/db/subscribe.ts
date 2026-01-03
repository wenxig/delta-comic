import { Utils, type uni, } from "delta-comic-core"
import Database from "@tauri-apps/plugin-sql"
import mitt from "mitt"
export const subscribeKey = new Utils.data.SourcedValue<[plugin: string, label: string]>()
export type SubscribeKey_ = Utils.data.SourcedKeyType<typeof subscribeKey>
export type SubscribeKey = Exclude<SubscribeKey_, string>

export interface RawAuthorSubscribeItem {
  plugin: string
  type: 'author'
  key: string
  author: string
}
export interface AuthorSubscribeItem {
  author: uni.item.Author
  type: 'author'
  key: string
  plugin: string
}

const _db = await Database.load('subscribe.db')
export interface EpSubscribeItem {
  itemKey: string // not f key
  type: 'ep'
  key: string
  plugin: string
}
export type SubscribeItem = AuthorSubscribeItem | EpSubscribeItem

export namespace SubscribeDb {
  export const db = _db

  export async function init() {
    await AuthorSubscribeDb.init()
    await EpSubscribeDb.init()
  }
  const emitter = mitt<{
    change: void
  }>()
  export function onChange(cb: () => void) {
    emitter.on('change', cb)
    return () => emitter.off('change', cb)
  }
  AuthorSubscribeDb.onChange(() => emitter.emit('change'))
  EpSubscribeDb.onChange(() => emitter.emit('change'))

  export async function upsertItem(item: SubscribeItem) {
    if (item.type == 'author')
      await AuthorSubscribeDb.upsertItem(item)
    else if (item.type == 'ep')
      await EpSubscribeDb.upsertItem(item)
  }
  export async function removeItem(key: SubscribeKey_) {
    // try remove from both
    await AuthorSubscribeDb.removeItem(key)
    await EpSubscribeDb.removeItem(key)
  }
  export async function getByQuery(query: string, params: any[]): Promise<SubscribeItem[]> {
    const authorItems = await AuthorSubscribeDb.getByQuery(query, params)
    const epItems = await EpSubscribeDb.getByQuery(query, params)
    return [...authorItems, ...epItems]
  }
}
namespace AuthorSubscribeDb {
  const db = SubscribeDb.db

  export async function init() {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS author_subscribe_items (
        plugin TEXT NOT NULL,
        type TEXT NOT NULL,
        key TEXT PRIMARY KEY,
        author TEXT NOT NULL
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

  export async function upsertItem(item: AuthorSubscribeItem) {
    await db.execute(`
      INSERT INTO author_subscribe_items (plugin, type, key, author) VALUES ($1, $2, $3, $4)
      ON CONFLICT(key) DO UPDATE SET plugin=excluded.plugin, type=excluded.type, author=excluded.author
    `, [item.plugin, item.type, item.key, JSON.stringify(item.author)])
    emitter.emit('change')
  }
  export async function removeItem(key: SubscribeKey_) {
    await db.execute(`
      DELETE FROM author_subscribe_items WHERE key = $1
    `, [subscribeKey.toString(key)])
    emitter.emit('change')
  }
  export async function getByQuery(query: string, params: any[]): Promise<AuthorSubscribeItem[]> {
    const rows = await db.select<RawAuthorSubscribeItem[]>(`
      SELECT plugin, type, key, author FROM author_subscribe_items
      WHERE ${query}
    `, params)
    return rows.map(row => ({
      plugin: row.plugin,
      type: row.type,
      key: row.key,
      author: JSON.parse(row.author)
    }))
  }
}

namespace EpSubscribeDb {
  const db = SubscribeDb.db
  export async function init() {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS ep_subscribe_items (
        itemKey TEXT NOT NULL,
        type TEXT NOT NULL,
        key TEXT PRIMARY KEY,
        plugin TEXT NOT NULL
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

  export async function upsertItem(item: EpSubscribeItem) {
    await db.execute(`
      INSERT INTO ep_subscribe_items (itemKey, type, key, plugin) VALUES ($1, $2, $3, $4)
      ON CONFLICT(key) DO UPDATE SET itemKey=excluded.itemKey, type=excluded.type, plugin=excluded.plugin
    `, [item.itemKey, item.type, item.key, item.plugin])
    emitter.emit('change')
  }
  export async function removeItem(key: SubscribeKey_) {
    await db.execute(`
      DELETE FROM ep_subscribe_items WHERE key = $1
    `, [subscribeKey.toString(key)])
    emitter.emit('change')
  }
  export async function getByQuery(query: string, params: any[]): Promise<EpSubscribeItem[]> {
    const rows = await db.select<EpSubscribeItem[]>(`
      SELECT itemKey, type, key, plugin FROM ep_subscribe_items
      WHERE ${query}
    `, params)
    return rows
  }
}