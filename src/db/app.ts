import Dexie, { Table } from 'dexie'
import relationships from 'dexie-relationships'
import { enc, MD5 } from 'crypto-js'
import { toRaw } from 'vue'
import { uni } from 'delta-comic-core'
export interface SaveItem {
  key: string
  item: uni.item.RawItem
}
export type SaveItem_ = SaveItem | uni.item.RawItem | uni.item.Item
export class AppDB extends Dexie {
  private static latestVersion = 0
  public static createVersion() {
    this.latestVersion++
    return this.latestVersion
  }
  public itemBase!: Table<SaveItem, SaveItem['key']>
  constructor() {
    super('AppDB', {
      addons: [
        relationships
      ]
    })
    this.version(AppDB.createVersion()).stores({
      itemBase: 'key, item',
    })
  }
  public static createSaveItemKey(item: uni.item.RawItem | uni.item.Item) {
    return MD5(`${item.$$plugin}_${uni.content.ContentPage.toContentTypeString(item.contentType)}_${item.id}`).toString(enc.Hex)
  }
  public static createSaveItem(item: SaveItem_): SaveItem {
    if ('key' in item) return toRaw(item)
    const key = this.createSaveItemKey(item)
    return {
      item: toRaw(uni.item.Item.is(item) ? toRaw(item).toJSON() : toRaw(item)),
      key
    }
  }
}
export const appDB = new AppDB()