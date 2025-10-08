import { deviceInfo } from "@/config"
import symbol from "@/symbol"
import { useLocalStorage } from "@vueuse/core"
import { type Table } from "dexie"
import { Utils,  type uni, Store, } from "delta-comic-core"
import { toRaw } from "vue"
import { AppDB, type SaveItem, type SaveItem_ } from "./app"
export interface HistoryItem {
  timestamp: number
  itemKey: string
  watchProgress: number
  ep: uni.ep.RawEp
  device: {
    name: string,
    id: string
  }
}
class HistoryDB extends AppDB {
  public historyItemBase!: Table<HistoryItem, HistoryItem['timestamp'], HistoryItem, {
    itemBase: SaveItem
  }>
  constructor() {
    super()
    this.version(AppDB.createVersion()).stores({
      historyItemBase: 'timestamp, itemKey -> itemBase.key, watchProgress, device, ep',
    })
  }
  public $add(...args: Parameters<typeof this.$forceJoin>) {
    return Store.useConfig()["app.recordHistory"] ? this.$forceJoin(...args) : Utils.data.PromiseContent.resolve(undefined)
  }
  public $forceJoin(...items: ({
    history?: HistoryItem,
    item: SaveItem_,
    ep: uni.ep.RawEp
  })[]) {
    return Utils.data.PromiseContent.fromPromise(this.transaction('readwrite', [this.itemBase, this.historyItemBase], async () => {
      console.log(`[history db] forceJoin`, items)
      await this.itemBase.bulkPut(items.map(v => AppDB.createSaveItem(v.item)))
      await Promise.all(items.map(async ({ item: item_, history, ep }) => {
        console.log(`[history db] forceJoin`, item_)
        const item = AppDB.createSaveItem(item_)
        if (history) {
          history.itemKey = item.key
          await this.historyItemBase.put(toRaw(history))
          return
        }
        const dbHistory = await this.historyItemBase.where({ itemKey: item.key }).first()
        await this.historyItemBase.put({
          device: {
            id: `${navigator.userAgent}|${deviceInfo?.osVersion}|${deviceInfo?.name}`,
            name: deviceInfo?.name ?? 'web'
          },
          itemKey: item.key,
          timestamp: Date.now(),
          ep,
          watchProgress: dbHistory?.watchProgress ?? 0
        })
      }))
    }))
  }

  public $remove(...keys: HistoryItem['timestamp'][]) {
    return Utils.data.PromiseContent.fromPromise(this.transaction('readwrite', [this.historyItemBase], async () => {
      await this.historyItemBase.bulkDelete(keys)
    }))
  }

  public filter = useLocalStorage(symbol.historyFilterHistory, new Array<string>())
}
export const historyDB = new HistoryDB()
