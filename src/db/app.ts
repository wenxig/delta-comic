import { uni } from 'delta-comic-core'
import {
  JSONColumnType,
  Selectable,
} from 'kysely'

export interface ItemStoreTable {
  key: string
  item: JSONColumnType<uni.item.RawItem>
}

export type StoredItem = Selectable<ItemStoreTable>