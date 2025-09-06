import { cosav } from "@/api/cosav"
import { uni } from "@/api/union"
import { useConfig } from "@/config"
import symbol from "@/symbol"
import { useLocalStorage } from "@vueuse/core"
import dayjs from "dayjs"
import localforage from "localforage"
import { flatten, isArray } from "lodash-es"
import { defineStore } from "pinia"
import { shallowReactive } from "vue"

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

  const createKey = (item: ValueFrom | HistoryValue) => {
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
  const createValue = (v: ValueFrom) => {
    const result = <HistoryValue>{
      author: isArray(v.author) ? v.author : [v.author],
      title: v.title,
      id: v.id,
      type: uni.comic.Comic.is(v) ? 'comic' : 'video',
      cover: uni.comic.Comic.is(v) ? v.cover.toString() : v.photo
    }
    return result
  }
  const config = useConfig()
  const $update = helper.action((item: ValueFrom, watchProgress: number, watchEp?: number) => {
    if (!config["app.recordHistory"]) return console.log('not logged', item)
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
    return db.setItem(key, value)
  }, 'update')
  const $remove = helper.action((item: HistoryValue) => {
    const key = createKey(item)
    history.delete(key)
    return db.removeItem(key)
  }, 'remove')
  const $get = helper.action((item: [id: string, source: string, type: string]) => {
    if (isArray(item)) return history.get(`${item[0]}@${item[1]}#${item[2]}`)
    return history.get(createKey(item))
  }, 'get')

  const filter = useLocalStorage(symbol.historyFilterHistory, new Array<string>())
  return { $update, $get, history, filters: filter, $remove, createKey }
})