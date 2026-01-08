import {
  Selectable,
} from 'kysely'
import { db } from '.'
import { Utils, type uni } from 'delta-comic-core'

export interface FavouriteCardTable {
  title: string
  private: boolean
  description: string
  createAt: number
}

export type FavouriteCard = Selectable<FavouriteCardTable>

export interface FavouriteItemTable {
  itemKey: string
  belongTo: FavouriteCardTable['createAt']
  addTime: number
  // pri
}

export type FavouriteItem = Selectable<FavouriteItemTable>

export namespace FavouriteDB {
  export function insertItem(item: uni.item.Item | uni.item.RawItem, belongTo: FavouriteItemTable['belongTo']) {
    return db.transaction()
      .setIsolationLevel('serializable')
      .execute(async () => {
        await db.replaceInto('itemStore')
          .values({
            item: Utils.data.Struct.toRaw(item),
            key: item.id
          })
          .execute()
        await db.replaceInto('favouriteItem')
          .values({
            addTime: Date.now(),
            itemKey: item.id,
            belongTo
          })
          .execute()
      })
  }
}