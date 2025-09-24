import { uni } from 'delta-comic-core'
import Dexie, { Table } from 'dexie'
import relationships from 'dexie-relationships'
import { enc, MD5 } from 'crypto-js'
export interface SaveItem {
  key: string
  item: uni.item.RawItem
}
export type SaveItem_ = SaveItem | uni.item.RawItem | uni.item.Item 
export const createSaveItem = (item: SaveItem_): SaveItem => {
  if ('key' in item) return item
  const key = MD5(`${item.$$plugin}_${uni.item.Item.toContentTypeString(item.contentType)}_${item.id}`).toString(enc.Hex)
  return {
    item: uni.item.Item.is(item) ? item.toJSON() : item,
    key
  }
}
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
    this.itemBase.with
  }
}
export const appDB = new AppDB()