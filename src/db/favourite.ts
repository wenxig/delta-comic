import {
  Generated,
  JSONColumnType,
  Selectable,
} from 'kysely'

export interface FavouriteCardTable {
  id: Generated<number>
  title: string
  private: boolean
  description: string
  createAt: number
}

export type FavouriteCard = Selectable<FavouriteCardTable>

export interface FavouriteItemTable {
  id: Generated<number>
  itemKey: string
  addTime: number
  belongTo: JSONColumnType<number[]>
}

export type FavouriteItem = Selectable<FavouriteItemTable>
