import type { uni } from 'delta-comic-core'
import Dexie, { Table } from 'dexie'
import relationships from 'dexie-relationships'
import type { FavouriteCard, FavouriteItem } from './favourite'
export interface SaveItem {
  key: string
  item: uni.item.RawItem
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
  }
}
export const appDB = new AppDB()