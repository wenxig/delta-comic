import { Utils, type uni, } from "delta-comic-core"
import { AppDB, type SaveItem, type SaveItem_ } from "./app"
import type { Table } from "dexie"
import { useLocalStorage } from "@vueuse/core"
import symbol from "@/symbol"
export interface RecentViewItem {
  timestamp: number
  itemKey: string
  ep: uni.ep.RawEp
}
class RecentViewDb extends AppDB {
  constructor() {
    super()
    this.version(AppDB.createVersion()).stores({
      recentViewItemBase: 'timestamp, itemKey -> itemBase.key, ep',
    })
  }
  public recentViewItemBase!: Table<RecentViewItem, RecentViewItem['timestamp'], RecentViewItem, {
    itemBase: SaveItem
  }>
  public $push(...items: ({
    recent?: RecentViewItem,
    item: SaveItem_,
    ep: uni.ep.RawEp
  })[]) {
    return Utils.data.PromiseContent.fromPromise(this.transaction('readwrite', [this.itemBase, this.recentViewItemBase], async () => {
      console.log(`[recent db] forceJoin`, items)
      await this.itemBase.bulkPut(items.map(v => AppDB.createSaveItem(v.item)))
      await Promise.all(items.map(async ({ item: item_, recent, ep }) => {
        console.log(`[recent db] forceJoin`, item_)
        const item = AppDB.createSaveItem(item_)
        if (recent) {
          recent.itemKey = item.key
          await this.recentViewItemBase.put(recent)
          return
        }
        await this.recentViewItemBase.put({
          itemKey: item.key,
          timestamp: Date.now(),
          ep
        })
      }))
    }))
  }
  public $remove(...keys: RecentViewItem['timestamp'][]) {
    return Utils.data.PromiseContent.fromPromise(this.transaction('readwrite', [this.recentViewItemBase], async () => {
      await this.recentViewItemBase.bulkDelete(keys)
    }))
  }

  public filter = useLocalStorage(symbol.recentFilterHistory, new Array<string>())
}
export const recentViewDb = new RecentViewDb()
