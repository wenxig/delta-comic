import { cosav } from "@/api/cosav"
import { uni } from "@/api/union"
import symbol from "@/symbol"
import { useLocalStorage } from "@vueuse/core"
import { MD5 } from "crypto-js"
import localforage from "localforage"
import { isArray, isNumber, uniq } from "lodash-es"
import { defineStore } from "pinia"
import { computed, shallowReactive, toRaw } from "vue"

export interface FavouriteValue {
  cover: string
  title: string
  author: string[]
  id: string
  type: 'video' | 'comic'
  belongTo: string[]
  key: string
  addtime: number
}
type ValueFrom = uni.comic.Comic | cosav.video.BaseVideo

export interface FavouriteItem {
  title: string
  private: boolean
  description: string
  createAt: number
  key: string
}

const db = localforage.createInstance({ name: 'favourite' })
const _keys = await db.keys()
const _favouriteCards = new Map(<[string, FavouriteItem][]>await Promise.all(_keys.filter(v => v.startsWith('card_')).map(async key => [key, await db.getItem<FavouriteItem>(key)])))
const _favouriteItem = new Map(<[string, FavouriteValue][]>await Promise.all(_keys.filter(v => v.startsWith('item_')).map(async key => [key, await db.getItem<FavouriteValue>(key)])))


export const useFavouriteStore = defineStore('favourite', helper => {
  const favouriteCards = shallowReactive(_favouriteCards)
  const favouriteItem = shallowReactive(_favouriteItem)

  const isFavouriteValue = (v: any): v is FavouriteValue => 'belongTo' in v
  const createValue = (v: ValueFrom | FavouriteValue, aims: string[], key: string) => {
    if (isFavouriteValue(v)) {
      const result: FavouriteValue = {
        ...v,
        belongTo: uniq(aims)
      }
      return result
    }
    const result: FavouriteValue = {
      author: toRaw(isArray(v.author) ? v.author : [v.author]),
      title: v.title,
      id: v.id,
      type: uni.comic.Comic.is(v) ? 'comic' : 'video',
      cover: uni.comic.Comic.is(v) ? v.cover.toString() : v.photo,
      belongTo: uniq(aims),
      key,
      addtime: Date.now()
    }
    return result
  }
  const createValueKey = (item: ValueFrom | FavouriteValue) => {
    let key = item.id
    if (cosav.video.BaseVideo.is(item)) {
      key += '#video'
    } else if (uni.comic.Comic.is(item)) {
      key += '#comic'
    } else {
      key += `#${item.type}`
    }
    return `item_${key}`
  }
  const createKey = (itemOrCreateAt: FavouriteItem | number) => {
    if (isNumber(itemOrCreateAt)) return `card_${MD5(itemOrCreateAt.toString()).toString()}`
    return `card_${MD5(itemOrCreateAt.createAt.toString()).toString()}`
  }

  const $updateCard = helper.action(async (title: string, description: string, createAt: number = Date.now(), isPrivate: boolean = false) => {
    const key = createKey(createAt)
    const value: FavouriteItem = {
      title,
      description,
      private: isPrivate,
      createAt,
      key
    }
    favouriteCards.set(key, value)
    try {
      await db.setItem(key, value)
    } catch (err) {
      console.warn(err, value)
      throw err
    }
    return key
  }, 'updateCard')
  const $clearCard = helper.action((key: string) => Promise.all([...favouriteItem.values()].map(item => $updateItem(item, ...item.belongTo.filter(v => v != key)))), 'clearCard')
  const $removeCard = helper.action((...keys: string[]) => Promise.all(keys.map(async key => {
    favouriteCards.delete(key)
    await $clearCard(key)
    await db.removeItem(key)
  })), 'removeCard')

  const $updateItem = helper.action(async (value: ValueFrom | FavouriteValue, ...aims: string[]) => {
    const key = createValueKey(value)
    const _value = createValue(value, aims, key)
    favouriteItem.set(key, _value)
    try {
      await db.setItem(key, _value)
    } catch (err) {
      console.warn(err, value)
      throw err
    }
  }, 'updateItem')
  const $removeItem = helper.action(async (key: string) => {
    favouriteItem.delete(key)
    try {
      await db.removeItem(key)
    } catch (err) {
      console.warn(err, key)
      throw err
    }
  }, 'removeItem')


  const $init = helper.action(async () => {
    if (favouriteCards.size == 0) {
      await $updateCard('默认收藏夹', '', 0)
    }
  }, 'init')

  const defaultPack = computed(() => favouriteCards.get(createKey(0))!)

  const mainFilters = useLocalStorage(symbol.favouriteFilterHistory, new Array<string>())
  const infoFilters = useLocalStorage(symbol.favouriteInfoFilterHistory, new Array<string>())
  return { infoFilters, mainFilters, favouriteCards, favouriteItem, defaultPack, $updateCard, $clearCard, $removeCard, $updateItem, $removeItem, createKey, createValue, createValueKey, $init }
})