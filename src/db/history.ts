import { deviceInfo, useConfig } from "@/config"
import symbol from "@/symbol"
import { useLocalStorage } from "@vueuse/core"
import { defineStore } from "pinia"
import { AppDB, createSaveItem, type SaveItem, type SaveItem_ } from "."
import { type Table } from "dexie"
import { useLiveQueryRef } from "@/utils/db"
import { PromiseContent } from "delta-comic-core"
export interface HistoryItem {
  timestamp: number
  itemKey: string
  watchProgress: number
  device: {
    name: string,
    id: string
  }
}
class HistoryDB extends AppDB {
  public historyItemBase!: Table<HistoryItem, HistoryItem['itemKey'], HistoryItem, {
    itemBase: SaveItem
  }>
  constructor() {
    super()
    this.version(AppDB.createVersion()).stores({
      historyItemBase: 'itemKey -> itemBase.key, timestamp, watchProgress, device',
    })
  }
}
export const historyDB = new HistoryDB()


export const useHistoryStore = defineStore('history', helper => {
  const config = useConfig()
  const $add = helper.action((...args: Parameters<typeof $join>) => config["app.recordHistory"] ? $join(...args) : PromiseContent.resolve(undefined), 'add')

  const $join = helper.action((...items: ({
    history?: HistoryItem,
    item: SaveItem_
  })[]) => PromiseContent.fromPromise(historyDB.transaction('readwrite', [historyDB.itemBase, historyDB.historyItemBase], async tran => {
    await tran.itemBase.bulkPut(items.map(v => createSaveItem(v.item)))
    await Promise.all(items.map(async ({ item: item_, history }) => {
      const item = createSaveItem(item_)
      if (history) {
        history.itemKey = item.key
        await tran.historyItemBase.put(history)
        return
      }
      const dbHistory = await tran.historyItemBase.where({ itemKey: item.key }).first()
      await tran.historyItemBase.put({
        device: {
          id: `${navigator.userAgent}|${deviceInfo?.osVersion}|${deviceInfo?.name}`,
          name: deviceInfo?.name ?? 'web'
        },
        itemKey: item.key,
        timestamp: Date.now(),
        watchProgress: dbHistory?.watchProgress ?? 0
      })
    }))
  })), 'join')

  const $remove = helper.action((...keys: HistoryItem['itemKey'][]) => PromiseContent.fromPromise(historyDB.transaction('readwrite', [historyDB.historyItemBase], async tran => {
    await tran.historyItemBase.bulkDelete(keys)
  })), 'remove')

  const filter = useLocalStorage(symbol.historyFilterHistory, new Array<string>())

  const history = useLiveQueryRef(() => historyDB.historyItemBase.with({
    itemBase: 'itemKey'
  }), [])

  return { filters: filter, history, $join, $remove, $add }
})
