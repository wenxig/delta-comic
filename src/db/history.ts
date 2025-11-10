import { deviceInfo } from "@/config"
import symbol from "@/symbol"
import { useLocalStorage } from "@vueuse/core"
import { type Table } from "dexie"
import { Utils, type uni, Store, } from "delta-comic-core"
import { toRaw } from "vue"
import { AppDB, type SaveItem, type SaveItem_ } from "./app"
export interface HistoryItem {
  timestamp: number
  itemKey: string
  itemKey2: string
  watchProgress: number
  ep: uni.ep.RawEp
  device: {
    name: string,
    id: string
  }
}
class HistoryDB extends AppDB {
  public historyItemBase!: Table<HistoryItem, HistoryItem['itemKey2'], HistoryItem, {
    itemBase: SaveItem
  }>
  constructor() {
    super()
    this.version(AppDB.createVersion()).stores({
      historyItemBase: '&itemKey2, timestamp, itemKey -> itemBase.key, watchProgress, device, ep',
    })
  }
  public $add(...args: Parameters<typeof this.$forceJoin>) {
    return Store.useConfig().$load(Store.appConfig).value.recordHistory ? this.$forceJoin(...args) : Utils.data.PromiseContent.resolve(undefined)
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
          history = JSON.parse(JSON.stringify(history))
          history!.itemKey = item.key
          await this.historyItemBase.put(history!)
          return
        }
        await this.historyItemBase.put(JSON.parse(JSON.stringify({
          device: {
            id: `${navigator.userAgent}|${deviceInfo?.osVersion}|${deviceInfo?.name}`,
            name: deviceInfo?.name ?? 'web'
          },
          itemKey: item.key,
          itemKey2: item.key,
          timestamp: Date.now(),
          ep,
          watchProgress: NaN
        })))
      }))
    }))
  }

  public $remove(...keys: HistoryItem['itemKey2'][]) {
    return Utils.data.PromiseContent.fromPromise(this.transaction('readwrite', [this.historyItemBase], async () => {
      await this.historyItemBase.bulkDelete(keys)
    }))
  }

  public filter = useLocalStorage(symbol.historyFilterHistory, new Array<string>())
}
export const historyDB = new HistoryDB()
