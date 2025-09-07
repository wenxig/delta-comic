import { cosav } from "@/api/cosav"
import { uni } from "@/api/union"
import { MD5 } from "crypto-js"
import localforage from "localforage"
import { isArray, isNumber, remove } from "lodash-es"
import { defineStore } from "pinia"
import { computed, shallowReactive, toRaw } from "vue"

export interface FavouriteValue {
  cover: string
  title: string
  author: string[]
  id: string
  type: 'video' | 'comic'
  key: string
}
type ValueFrom = uni.comic.Comic | cosav.video.FullVideo

export interface FavouriteItem {
  value: FavouriteValue[]
  title: string
  private: boolean
  description: string
  createAt: number
  key: string
}

const db = localforage.createInstance({ name: 'favourite' })
window.$api.db = db
const _keys = await db.keys()
const _favourite = new Map(<[string, FavouriteItem][]>await Promise.all(_keys.map(async key => [key, await db.getItem<FavouriteItem>(key)])))

export const useFavouriteStore = defineStore('favourite', helper => {
  const favourite = shallowReactive(_favourite)

  const createValue = (v: ValueFrom) => {
    const result: FavouriteValue = {
      author: toRaw(isArray(v.author) ? v.author : [v.author]),
      title: v.title,
      id: v.id,
      type: uni.comic.Comic.is(v) ? 'comic' : 'video',
      cover: uni.comic.Comic.is(v) ? v.cover.toString() : v.photo,
      key: createValueKey(v)
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
    return key
  }
  const createKey = (itemOrCreateAt: FavouriteItem | number) => {
    if (isNumber(itemOrCreateAt)) return MD5(itemOrCreateAt.toString()).toString()
    return MD5(itemOrCreateAt.createAt.toString()).toString()
  }

  const flatFavourites = computed(() => [...favourite.values()].flatMap(v => v.value))

  const $updateCard = helper.action(async (title: string, description: string, createAt = Date.now(), data?: FavouriteValue[], isPrivate = false) => {
    const key = createKey(createAt)
    const old = favourite.get(key)
    const value: FavouriteItem = {
      title,
      description,
      private: isPrivate,
      createAt,
      value: data?.map(v => toRaw(v)) ?? old?.value ?? [],
      key
    }
    favourite.set(key, value)
    try {
      console.log(await db.setItem(key, value))
    } catch (err) {
      console.warn(err, value)
      throw err
    }
  }, 'updateCard')
  const $removeCard = helper.action((...keys: string[]) => Promise.all(keys.map(key => {
    favourite.delete(key)
    return db.removeItem(key)
  })), 'removeCard')

  const $pushItem = helper.action((to: FavouriteItem, ...values: ValueFrom[]) => {
    const cardKey = to.key
    const card = favourite.get(cardKey)
    if (!card) throw new Error('not found card')
    for (const value of values) {
      const _value = createValue(value)
      card.value.unshift(_value)
    }
    favourite.set(cardKey, card)
    return $updateCard(to.title, to.description, to.createAt, card.value, to.private)
  }, 'pushItem')
  const $removeItem = helper.action((from: FavouriteItem, ...keys: string[]) => {
    const cardKey = from.key
    const card = favourite.get(cardKey)
    if (!card) throw new Error('not found card')
    remove(card.value, ({ key }) => keys.includes(key))
    favourite.set(cardKey, card)
    return $updateCard(from.title, from.description, from.createAt, card.value, from.private)
  }, 'removeItem')


  const $init = helper.action(async () => {
    if (favourite.size == 0) {
      await $updateCard('默认收藏夹', '', 0)
    }
  }, 'init')

  const defaultPack = computed(() => favourite.get(createKey(0))!)

  return { favourite, defaultPack, flatFavourites, $updateCard, $removeCard, $pushItem, $removeItem, createKey, createValue, createValueKey, $init }
})