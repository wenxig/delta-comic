import { Utils, type uni, } from "delta-comic-core"
import { type Table, Dexie } from "dexie"
export interface AuthorSubscribeItem {
  author: uni.item.Author
  type: 'author'
  key: string
}
export type SubscribeItem = AuthorSubscribeItem

class SubscribeDb extends Dexie {
  constructor() {
    super('SubscribeDb')
    this.version(1).stores({
      author: 'key, type',
    })
  }
  public all!: Table<SubscribeItem, SubscribeItem['key']>
  public $add(...items: (SubscribeItem)[]) {
    return Utils.data.PromiseContent.fromPromise(this.transaction('readwrite', [this.all], async () => {
      console.log(`[SubscribeDb] add`, items)
      await Promise.all(Object.entries(Object.groupBy(items, v => v.type)).map(async ([type, items]) => {
        if (type == 'author')
          await this.all.bulkPut(items)
      }))
    }))
  }
  public $remove(...keys: SubscribeItem['key'][]) {
    return Utils.data.PromiseContent.fromPromise(this.transaction('readwrite', [this.all], async () => {
      await this.all.bulkDelete(keys)
    }))
  }
  public static createKey(plugin: string, label: string) {
    return `${plugin}:${label}`
  }
}
export const subscribeDb = new SubscribeDb()
