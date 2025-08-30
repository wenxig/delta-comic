import { bika } from "@/api/bika"
import { cosav } from "@/api/cosav"
import { jm } from "@/api/jm"
import { uni } from "@/api/union"
import dayjs from "dayjs"
import localforage from "localforage"
import { isArray } from "lodash-es"
import { defineStore } from "pinia"
import { computed, shallowReactive, toRaw, watch } from "vue"

type HistoryRawValue = uni.comic.JSONComic | cosav.video.RawFullVideo
export type HistoryValue = uni.comic.Comic | cosav.video.FullVideo

interface RawHistoryItem {
  timestamp: number
  value: HistoryRawValue
  timeSplit: string
  watchProgress: number
  watchEp?: number
}
export interface HistoryItem {
  timestamp: number
  value: HistoryValue
  timeSplit: string
  watchProgress: number
  watchEp?: number
}

const _history = new Map(await localforage.getItem<[string, RawHistoryItem][]>('history'))

export const useHistoryStore = defineStore('history', helper => {
  const history = shallowReactive(_history)
  watch(history, history => {
    const his = [...history.entries()]
    console.log('history change!', his.map(v => [v[1].value.title, v[1].value]))
    localforage.setItem<[string, RawHistoryItem][]>('history', his)
  })

  const createKey = (item: HistoryValue) => {
    let key = item.id
    if (cosav.video.BaseVideo.is(item)) {
      key += '@cosav#video'
    } else if (bika.comic.BaseComic.is(item.$raw)) {
      key += '@bika#comic'
    } else if (jm.comic.BaseComic.is(item.$raw)) {
      key += '@jm#comic'
    } else {
      console.log(item.$raw, jm.comic.BaseComic.is(item.$raw), bika.comic.BaseComic.is(item.$raw))
      throw new Error('unknown item type')
    }
    return key
  }
  const $update = helper.action((item: HistoryValue, watchProgress: number, watchEp?: number) => {
    const key = createKey(item)
    const time = dayjs()
    console.log(toRaw(item.toJSON()))
    history.set(key, {
      timestamp: time.unix(),
      timeSplit: time.format('YYYY-MM-DD'),
      value: toRaw(item.toJSON()),
      watchProgress,
      watchEp
    })
  }, 'update')
  const $get = helper.action((item: HistoryValue | [id: string, source: string, type: string]) => {
    if (isArray(item)) return history.get(`${item[0]}@${item[1]}#${item[2]}`)
    return history.get(createKey(item))
  }, 'get')
  const historyProcessed = computed(() => new Map([...history.entries()].map(v => {
    if (uni.comic.Comic.isJSON(v[1].value)) {
      (<HistoryItem>v[1]).value = new uni.comic.Comic(v[1].value)
    } else {
      (<HistoryItem>v[1]).value = new cosav.video.FullVideo(v[1].value)
    }
    return [v[0], <HistoryItem>v[1]]
  })))
  return { $update, $get, history: historyProcessed }
})