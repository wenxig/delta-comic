import { usePluginStore } from "@/plugin/store"
import { Utils, type uni, } from "delta-comic-core"
import { type Table, Dexie } from "dexie"
import { isString } from "es-toolkit"
export interface AuthorSubscribeItem {
  author: uni.item.Author
  type: 'author'
  key: string
  plugin: string
}
export interface EpSubscribeItem {
  eps: uni.ep.Ep[]
  type: 'ep'
  key: string
  plugin: string
}
export type SubscribeItem = AuthorSubscribeItem | EpSubscribeItem

export class SubscribeDb extends Dexie {
  constructor() {
    super('SubscribeDb')
    this.version(1).stores({
      all: 'key, type',
    })
  }
  public all!: Table<SubscribeItem, SubscribeItem['key']>
  public async $add(...items: (SubscribeItem)[]) {
    console.log(this.all)
    await this.transaction('readwrite', [this.all], async () => {
      console.log(`[SubscribeDb] add`, items)
      await Promise.all(Object.entries(Object.groupBy(items, v => v.type)).map(async ([type, items]) => {
        if (type == 'author')
          await this.all.bulkPut(JSON.parse(JSON.stringify(items)))
      }))
    })
    const pluginStore = usePluginStore()
    Array.from(pluginStore.plugins.entries())
      .filter(v => items.some(k => k.plugin == v[0]))
      .flatMap(v => Object.entries(v[1].subscribe!)
        .flatMap(sub =>
          items.some(k => {
            if (k.type != 'author') throw new Error
            return k.author.subscribe! == sub[0]
          }) ? () => items.filter(k => k.type == 'author').flatMap(k => sub[1].onAdd?.(k.author)) : undefined
        )).map(v => v?.())
  }
  public async $remove(...items: (SubscribeItem | SubscribeItem['key'])[]) {
    const all = await Promise.all(items.map(async v => isString(v) ? (await this.all.get(v))! : v))
    await Utils.data.PromiseContent.fromPromise(this.transaction('readwrite', [this.all], async () => {
      await this.all.bulkDelete(items.map(v => isString(v) ? v : v.key))
    }))
    const pluginStore = usePluginStore()
    Array.from(pluginStore.plugins.entries())
      .filter(v => all.some(k => k.plugin == v[0]))
      .flatMap(v => Object.entries(v[1].subscribe!)
        .flatMap(sub =>
          all.some(k => {
            if (k.type != 'author') throw new Error
            return k.author.subscribe! == sub[0]
          }) ? () => all.filter(k => k.type == 'author').flatMap(k => sub[1].onRemove?.(k.author)) : undefined
        )).map(v => v?.())
  }
  public static createKey(plugin: string, label: string) {
    return `${plugin}:${label}`
  }
}
export const subscribeDb = new SubscribeDb()
