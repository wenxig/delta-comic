import { cosav } from "@/api/cosav"
import { uni } from "@/api/union"
import dayjs from "dayjs"
import localforage from "localforage"
import { isArray, times } from "lodash-es"
import { defineStore } from "pinia"
import { computed, shallowReactive, toRaw, watch } from "vue"

export interface HistoryValue {
  cover: string
  title: string
  author: string[]
  id: string
  type: 'video' | 'comic'
}
type ValueFrom = uni.comic.Comic | cosav.video.FullVideo

export interface HistoryItem {
  timestamp: number
  value: HistoryValue
  timeSplit: string
  watchProgress: number
  watchEp?: number
}
const db = localforage.createInstance({ name: 'history' })
const _keys = await db.keys()
const _history = new Map(<[string, HistoryItem][]>await Promise.all(_keys.map(async key => [key, await db.getItem<HistoryItem>(key)])))
export const useHistoryStore = defineStore('history', helper => {
  const history = shallowReactive(_history)

  const createKey = (item: ValueFrom) => {
    let key = item.id
    if (cosav.video.BaseVideo.is(item)) {
      key += '#video'
    } else if (uni.comic.Comic.is(item)) {
      key += '#comic'
    } else {
      console.log(item)
      throw new Error('unknown item type')
    }
    return key
  }
  const createValue = (v: ValueFrom) => {
    const result = <HistoryValue>{
      author: v.author,
      title: v.title,
      id: v.id,
      type: uni.comic.Comic.is(v) ? 'comic' : 'video',
      cover: uni.comic.Comic.is(v) ? v.cover.toString() : v.photo
    }
    return result
  }
  const $update = helper.action((item: ValueFrom, watchProgress: number, watchEp?: number) => {
    const key = createKey(item)
    const time = dayjs()
    const value: HistoryItem = {
      timestamp: time.unix(),
      timeSplit: time.format('YYYY-MM-DD HH:mm'),
      value: createValue(item),
      watchProgress,
      watchEp
    }
    history.set(key, value)
    db.setItem(key, value)
  }, 'update')
  const $get = helper.action((item: [id: string, source: string, type: string]) => {
    if (isArray(item)) return history.get(`${item[0]}@${item[1]}#${item[2]}`)
    return history.get(createKey(item))
  }, 'get')
  return { $update, $get, history }
})