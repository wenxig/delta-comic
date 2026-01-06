import { uni } from 'delta-comic-core'
import {
  Generated,
  JSONColumnType,
  Selectable,
} from 'kysely'

export interface ItemStoreTable {
  id: Generated<string>
  key: string
  item: JSONColumnType<uni.item.RawItem>
}

export type StoredItem = Selectable<ItemStoreTable>