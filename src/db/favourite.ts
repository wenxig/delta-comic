import {
  Generated,
  JSONColumnType,
  Selectable,
} from 'kysely'

export interface FavouriteCardTable {
  id: Generated<string>
  title: string
  private: boolean
  description: string
  createAt: number
}

export type FavouriteCard = Selectable<FavouriteCardTable>

export interface FavouriteItemTable {
  id: Generated<string>
  itemKey: string
  addTime: number
  belongTo: JSONColumnType<number[]>
}

export type FavouriteItem = Selectable<FavouriteItemTable>
