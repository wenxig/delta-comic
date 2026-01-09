import {
  Selectable,
} from 'kysely'
import { db } from '.'
import { ItemStoreDB } from './itemStore'


export namespace FavouriteDB {
  export interface CardTable {
    title: string
    private: boolean
    description: string
    createAt: number
  }

  export type Card = Selectable<CardTable>

  export interface ItemTable {
    itemKey: string
    belongTo: CardTable['createAt']
    addTime: number
  }

  export type Item = Selectable<ItemTable>

  export function insertItem(item: ItemStoreDB.StorableItem, belongTo: Item['belongTo']) {
    return db.value.transaction()
      .setIsolationLevel('serializable')
      .execute(async trx => {
        const itemKey = await ItemStoreDB.upsert(item)
        await trx.replaceInto('favouriteItem')
          .values({
            addTime: Date.now(),
            itemKey,
            belongTo
          })
          .execute()
      })
  }
}