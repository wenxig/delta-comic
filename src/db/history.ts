import { bika } from "@/api/bika"
import { cosav } from "@/api/cosav"
import { jm } from "@/api/jm"
import type { uni } from "@/api/union"
import dayjs from "dayjs"
import localforage from "localforage"
import { isArray } from "lodash-es"
import { defineStore } from "pinia"
import { shallowReactive, watch } from "vue"

type HistoryRawValue = uni.comic.JSONComic | cosav.video.BaseVideo
export type HistoryValue = uni.comic.Comic | cosav.video.BaseVideo
export interface HistoryItem {
  timestamp: number
  value: HistoryValue
  timeSplit: string
  watchProgress: number
  watchEp?: number
}

const _history = new Map(await localforage.getItem<[string, HistoryRawValue][]>('history'))

export const useHistoryStore = defineStore('history', helper => {
  const history = shallowReactive(_history)
  watch(history, history => {
    localforage.setItem<[string, HistoryItem][]>('history', history.toJSON())
  })

  const createKey = (item: HistoryValue) => {
    let key = item.id
    if (cosav.video.BaseVideo.is(item)) {
      key += '@cosav#video'
    } else if (bika.comic.BaseComic.is(item)) {
      key += '@bika#comic'
    } else if (jm.comic.BaseComic.is(item)) {
      key += '@jm#comic'
    }
    return key
  }
  const $update = helper.action((item: HistoryValue, watchProgress: number, watchEp?: number) => {
    const key = createKey(item)
    const time = dayjs()
    history.set(key, {
      timestamp: time.unix(),
      timeSplit: time.format('YYYY-MM-DD'),
      value: item,
      watchProgress,
      watchEp
    })
  }, 'update')
  const $get = helper.action((item: HistoryValue | [id: string, source: string, type: string]) => {
    if (isArray(item)) return history.get(`${item[0]}@${item[1]}#${item[2]}`)
    return history.get(createKey(item))
  }, 'get')

  return { history, $update, $get }
})