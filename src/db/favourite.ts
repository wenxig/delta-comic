import symbol from "@/symbol"
import { useLocalStorage } from "@vueuse/core"
import { defineStore } from "pinia"
import { AppDB, createSaveItem, type SaveItem, type SaveItem_ } from "."
import type { Table } from "dexie"
import { useLiveQueryRef } from "@/utils/db"
import { defaults } from "lodash-es"
import { PromiseContent } from "delta-comic-core"

export interface FavouriteItem {
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
  public favouriteItemBase!: Table<FavouriteItem, FavouriteItem['addtime'], FavouriteItem, {
    itemBase: SaveItem
  }>
  public favouriteCardBase!: Table<FavouriteCard, FavouriteCard['createAt']>
  constructor() {
    super()
    this.version(AppDB.createVersion()).stores({
      favouriteItemBase: 'addtime, *belongTo, itemKey -> itemBase.key',
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

  const $setCards = helper.action(async (...cards: (Partial<Omit<FavouriteCard, 'title'>> & Pick<FavouriteCard, 'title'>)[]) => PromiseContent.fromPromise(
    favouriteDB.favouriteCardBase.bulkPut(cards.map(card => defaults(card, {
      private: false,
      description: '',
      createAt: Date.now()
    })))
  ), 'setCards')

  const $clearCards = helper.action((...cardCreateAts: FavouriteCard['createAt'][]) => PromiseContent.fromPromise(
    favouriteDB.favouriteItemBase.where('belongTo').anyOf(cardCreateAts).delete()
  ), 'clearCards')

  const $removeCards = helper.action((...cardCreateAts: FavouriteCard['createAt'][]) => PromiseContent.fromPromise(
    favouriteDB.transaction('readwrite', [favouriteDB.favouriteItemBase], async trans => {
      await $clearCards(...cardCreateAts)
      await trans.favouriteCardBase.bulkDelete(cardCreateAts)
    })
  ), 'removeCards')

  const $setItems = helper.action(async (...items: ({
    fItem?: FavouriteItem,
    item: SaveItem_,
    aims: FavouriteItem['belongTo']
  })[]) => PromiseContent.fromPromise(
    favouriteDB.transaction('readwrite', [favouriteDB.itemBase, favouriteDB.favouriteItemBase], async tran => {
      await tran.itemBase.bulkPut(items.map(v => createSaveItem(v.item)))
      await Promise.all(items.map(async ({ aims, item, fItem }) => tran.favouriteItemBase.put({
        addtime: fItem?.addtime ?? Date.now(),
        belongTo: aims.concat(fItem?.belongTo ?? []),
        itemKey: createSaveItem(item).key
      })))
    })
  ), 'setItems')
  const $removeItems = helper.action(async (...keys: FavouriteCard['createAt'][]) => PromiseContent.fromPromise(
    favouriteDB.favouriteItemBase.where('createAt').anyOf(keys).delete()
  ), 'removeItems')

  const mainFilters = useLocalStorage(symbol.favouriteFilterHistory, new Array<string>())
  const infoFilters = useLocalStorage(symbol.favouriteInfoFilterHistory, new Array<string>())
  return { infoFilters, mainFilters, favouriteItem, favouriteCard, $setCards, $clearCards, $removeCards, $setItems, $removeItems }
})