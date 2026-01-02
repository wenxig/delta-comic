import { usePluginStore } from "@/plugin/store"
import { Utils, type uni, } from "delta-comic-core"
import { isString } from "es-toolkit"
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
    // const pluginStore = usePluginStore()
    // Array.from(pluginStore.plugins.entries())
    //   .filter(v => item.plugin == v[0])
    //   .flatMap(v => Object.entries(v[1].subscribe!)
    //     .flatMap(sub =>
    //       item.some(k => {
    //         if (k.type != 'author') throw new Error
    //         return k.author.subscribe! == sub[0]
    //       }) ? () => item.filter(k => k.type == 'author').flatMap(k => sub[1].onAdd?.(k.author)) : undefined
    //     )).map(v => v?.())
  }
  export async function removeItem(key: SubscribeKey) {
    // try remove from both
    await AuthorSubscribeDb.removeItem(key)
    await EpSubscribeDb.removeItem(key)
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
  export async function removeItem(key: SubscribeKey) {
    await db.execute(`
      DELETE FROM author_subscribe_items WHERE key = $1
    `, [key])
    emitter.emit('change')
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
  export async function removeItem(key: SubscribeKey) {
    await db.execute(`
      DELETE FROM ep_subscribe_items WHERE key = $1
    `, [key])
    emitter.emit('change')
  }
}