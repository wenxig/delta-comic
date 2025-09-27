import { deviceInfo, useConfig } from "@/config"
import symbol from "@/symbol"
import { useLocalStorage } from "@vueuse/core"
import { type Table } from "dexie"
import { Utils, Db, } from "delta-comic-core"
export interface HistoryItem {
  timestamp: number
  itemKey: string
  watchProgress: number
  device: {
    name: string,
    id: string
  }
}
class HistoryDB extends Db.AppDB {
  public historyItemBase!: Table<HistoryItem, HistoryItem['itemKey'], HistoryItem, {
    itemBase: Db.SaveItem
  }>
  constructor() {
    super()
    this.version(Db.AppDB.createVersion()).stores({
      historyItemBase: 'itemKey -> itemBase.key, timestamp, watchProgress, device',
    })
  }
  public $add(...args: Parameters<typeof this.$join>) {
    return useConfig()["app.recordHistory"] ? this.$join(...args) : Utils.data.PromiseContent.resolve(undefined)
  }
  public $join(...items: ({
    history?: HistoryItem,
    item: Db.SaveItem_
  })[]) {
    return useConfig()["app.recordHistory"]
      ? Utils.data.PromiseContent.fromPromise(this.transaction('readwrite', [this.itemBase, this.historyItemBase], async () => {
        await this.itemBase.bulkPut(items.map(v => Db.AppDB.createSaveItem(v.item)))
        await Promise.all(items.map(async ({ item: item_, history }) => {
          const item = Db.AppDB.createSaveItem(item_)
          if (history) {
            history.itemKey = item.key
            await this.historyItemBase.put(history)
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
            watchProgress: dbHistory?.watchProgress ?? 0
          })
        }))
      }))
      : Utils.data.PromiseContent.resolve(undefined)
  }

  public $remove(...keys: HistoryItem['itemKey'][]) {
    return Utils.data.PromiseContent.fromPromise(this.transaction('readwrite', [this.historyItemBase], async () => {
      await this.historyItemBase.bulkDelete(keys)
    }))
  }

  public filter = useLocalStorage(symbol.historyFilterHistory, new Array<string>())
}
export const historyDB = new HistoryDB()
