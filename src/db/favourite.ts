import symbol from "@/symbol"
import { useLocalStorage } from "@vueuse/core"
import { defineStore } from "pinia"
import { AppDB, type SaveItem } from "."
import type { Table } from "dexie"
import { useLiveQueryRef } from "@/utils/db"

export interface FavouriteItem {
  key: string
  itemKey: string
  addtime: number
  belongTo: string[]
}

export interface FavouriteCard {
  title: string
  private: boolean
  description: string
  createAt: number
  key: string
}

class FavouriteDB extends AppDB {
  public favouriteItemBase!: Table<FavouriteItem, FavouriteItem['key'], {
    itemBase: SaveItem
  }>
  public favouriteCardBase!: Table<FavouriteCard, FavouriteCard['key']>
  constructor() {
    super()
    this.version(AppDB.createVersion()).stores({
      favouriteItemBase: 'key, addtime, belongTo, itemKey -> itemBase.key',
      favouriteCardBase: 'key, title, private, description, createAt'
    })
  }
}
export const favouriteDB = new FavouriteDB()

export const useFavouriteStore = defineStore('favourite', helper => {

  const favouriteItem = useLiveQueryRef(() => favouriteDB.favouriteItemBase.with({
    itemBase: 'itemKey'
  }), [])
  const favouriteCard = useLiveQueryRef(() => favouriteDB.favouriteCardBase.toArray(), [])

  const mainFilters = useLocalStorage(symbol.favouriteFilterHistory, new Array<string>())
  const infoFilters = useLocalStorage(symbol.favouriteInfoFilterHistory, new Array<string>())
  return { infoFilters, mainFilters, favouriteItem, favouriteCard }
})