import symbol from "@/symbol"
import { useLocalStorage } from "@vueuse/core"
import { defineStore } from "pinia"
import { AppDB, type SaveItem } from "."
import type { Table, Transaction } from "dexie"
import { useLiveQueryRef } from "@/utils/db"
import { MD5 } from "crypto-js"
import { isNumber } from "lodash-es"
import { PromiseContent } from "delta-comic-core"

export interface FavouriteItem {
  key: string
  itemKey: string
  addtime: number
  belongTo: (FavouriteCard['createAt'])[]
}

export interface FavouriteCard {
  title: string
  private: boolean
  description: string
  createAt: number
}

class FavouriteDB extends AppDB {
  public favouriteItemBase!: Table<FavouriteItem, FavouriteItem['key'], {
    itemBase: SaveItem
  }>
  public favouriteCardBase!: Table<FavouriteCard, FavouriteCard['createAt']>
  constructor() {
    super()
    this.version(AppDB.createVersion()).stores({
      favouriteItemBase: 'key, addtime, belongTo, itemKey -> itemBase.key',
      favouriteCardBase: 'createAt, key, title, private, description'
    })
  }
}
export const favouriteDB = new FavouriteDB()

export const useFavouriteStore = defineStore('favourite', helper => {

  const favouriteItem = useLiveQueryRef(() => favouriteDB.favouriteItemBase.with({
    itemBase: 'itemKey'
  }), [])
  const favouriteCard = useLiveQueryRef(() => favouriteDB.favouriteCardBase.toArray(), [])

  const $setCard = helper.action(async (title: string, description: string, createAt: number = Date.now(), isPrivate: boolean = false, trans?: Transaction & Pick<FavouriteDB, 'favouriteCardBase'>) => {
    const value: FavouriteCard = {
      title,
      description,
      private: isPrivate,
      createAt,
    }
    return (trans ?? favouriteDB).favouriteCardBase.put(value)
  }, 'setCard')

  const $clearCard = helper.action((cardCreateAt: FavouriteCard['createAt'], trans?: Transaction & Pick<FavouriteDB, 'favouriteItemBase'>) => PromiseContent.fromPromise((trans ?? favouriteDB).favouriteItemBase.toCollection().filter(v => v.belongTo.includes(cardCreateAt)).delete()), 'clearCard')

  const $removeCards = helper.action((...cardCreateAts: (FavouriteCard['createAt'])[]) => PromiseContent.fromPromise(favouriteDB.transaction('readwrite', [favouriteDB.favouriteItemBase], async trans => {
    for (const createAt of cardCreateAts) {
      await $clearCard(createAt, trans)
    }
  })), 'removeCards')


  // const $updateItem = helper.action(async (value: ValueFrom | FavouriteValue, ...aims: string[]) => {
  //   const key = createValueKey(value)
  //   const _value = createValue(value, aims, key)
  //   favouriteItem.set(key, _value)
  //   try {
  //     await db.setItem(key, _value)
  //   } catch (err) {
  //     console.warn(err, value)
  //     throw err
  //   }
  // }, 'updateItem')
  // const $removeItem = helper.action(async (key: string) => {
  //   favouriteItem.delete(key)
  //   try {
  //     await db.removeItem(key)
  //   } catch (err) {
  //     console.warn(err, key)
  //     throw err
  //   }
  // }, 'removeItem')

  const mainFilters = useLocalStorage(symbol.favouriteFilterHistory, new Array<string>())
  const infoFilters = useLocalStorage(symbol.favouriteInfoFilterHistory, new Array<string>())
  return { infoFilters, mainFilters, favouriteItem, favouriteCard, $setCard, $clearCard, $removeCards }
})