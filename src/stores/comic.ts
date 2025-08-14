import { defineStore } from 'pinia'
import { computed, shallowReactive, shallowRef } from 'vue'
import { isBoolean, isNumber } from 'lodash-es'
import { PromiseContent } from '@/utils/data'
import { bika } from '@/api/bika'
import { jm } from '@/api/jm'
import { uni } from '@/api/union'

export const useComicStore = defineStore('comic', () => {
  const pageHistory = shallowReactive(new Map<string, ComicPage>())
  const $load = (id: string, preload?: JmPreloadValue | BikaPreloadValue | uni.comic.Comic<any> | false, load = true) => {
    if (pageHistory.has(id)) {
      now.value = pageHistory.get(id)!
      console.log('page cache hit', now.value)
    } else {
      now.value = createComicPage(id, preload, false)
      pageHistory.set(id, now.value)
      console.log('page cache miss', now.value)
    }
    if (load) now.value.loadAll()
  }
  const now = shallowRef<ComicPage>()
  return {
    history: pageHistory,
    now,
    $load
  }
})

export function createComicPage(comicId: string | number, preload?: BikaPreloadValue | JmPreloadValue | uni.comic.Comic<any> | false, autoLoad: boolean = false): BikaComicPage | JmComicPage {
  if (uni.comic.Comic.is(preload)) preload = preload.$raw
  comicId = Number.isNaN(Number(comicId)) ? comicId : Number(comicId)
  if (isNumber(comicId) && (jm.comic.BaseComic.is(preload) || preload == undefined)) {
    return new JmComicPage(preload, Number(comicId), autoLoad)
  } else if(isBoolean(preload) || bika.comic.BaseComic.is(preload) || preload == undefined) {
    return new BikaComicPage(preload, comicId.toString(), autoLoad)
  }
  throw new Error('Invalid comicId or preload type')
}
export type ComicPage = BikaComicPage | JmComicPage

type JmPreloadValue = jm.comic.BaseComic | undefined
export class JmComicPage {
  constructor(preload: JmPreloadValue, public comicId: number, autoLoad = true) {
    this.preload.value = uni.comic.Comic.is<jm.comic.BaseComic>(preload) ? <JmPreloadValue>preload.$raw : preload
    this.pid.resolve(comicId)
    if (jm.comic.FullComic.is(this.preload.value)) this.setDetail(this.preload.value)
    if (autoLoad) this.loadAll()
  }
  public preload = shallowRef<JmPreloadValue>(undefined)
  public detail = PromiseContent.withResolvers<jm.comic.FullComic>(true)
  public union = computed(() => this.detail.content.data.value ?? this.preload.value)
  public setDetail(comic: jm.comic.FullComic) {
    this.preload.value = comic
    this.detail.resolve(comic)
    this.recommendComics.resolve(comic.$related_list)
    this.eps.resolve(comic.$series)
  }
  public async loadDetailFromNet() {
    this.detail.reset()
    try {
      this.detail.content.isLoading.value = true
      const info = await jm.api.comic.getComic(this.comicId)
      this.setDetail(info)
    } catch {
      this.detail.reject()
    }
  }
  public reloadDetailFromNet() {
    this.preload.value = undefined
    return this.loadDetailFromNet()
  }
  public recommendComics = PromiseContent.withResolvers<jm.comic.RecommendComic[]>(true)
  public eps = PromiseContent.withResolvers<jm.comic.Series[]>(true)
  public pid = PromiseContent.withResolvers<number>(true)
  public veiled = shallowRef(true)
  public loadAll() {
    return Promise.any<boolean | void>([
      !this.detail.content.data.value && !this.detail.content.isLoading.value && this.loadDetailFromNet()
    ])
  }
  public reloadAll() {
    return Promise.any<void>([
      this.reloadDetailFromNet(),
    ])
  }
}

type BikaPreloadValue = bika.comic.BaseComic | undefined
export class BikaComicPage {
  constructor(preload: BikaPreloadValue | false, public comicId: string, autoLoad = true) {
    const truePreload = uni.comic.Comic.is<bika.comic.BaseComic>(preload) ? <BikaPreloadValue>preload.$raw : preload
    if (isBoolean(truePreload)) {
      this.veiled.value = truePreload
      return
    }
    if (bika.comic.FullComic.is(truePreload)) this.setDetail(truePreload)
    this.preload.value = truePreload
    if (autoLoad) this.loadAll()
  }
  public preload = shallowRef<BikaPreloadValue>(undefined)
  public detail = PromiseContent.withResolvers<bika.comic.FullComic>()
  public union = computed(() => this.detail.content.data.value ?? this.preload.value)
  public setDetail(comic: bika.comic.FullComic | false) {
    if (isBoolean(comic)) {
      this.veiled.value = false
      this.preload.value = undefined
      this.detail.reject('ban')
      return
    }
    this.preload.value = comic
    this.detail.resolve(comic)
  }
  public async loadDetailFromNet() {
    this.detail.reset()
    try {
      this.detail.content.isLoading.value = true
      const info = await bika.api.comic.getComicInfo(this.comicId)
      this.setDetail(info)
    } catch {
      this.detail.reject()
    }
  }
  public reloadDetailFromNet() {
    this.preload.value = undefined
    return this.loadDetailFromNet()
  }

  public recommendComics = PromiseContent.withResolvers<bika.comic.LessComic[]>()
  public setRecommendComics(recommendComics: bika.comic.LessComic[]) {
    this.recommendComics.resolve(recommendComics)
  }
  public async loadRecommendComics() {
    this.recommendComics.reset()
    try {
      this.recommendComics.content.isLoading.value = true
      const recommends = await bika.api.comic.getRecommendComics(this.comicId)
      this.setRecommendComics(recommends)
    } catch {
      this.recommendComics.reject(undefined)
    }
  }
  public reloadRecommendComicsFromNet() {
    this.recommendComics.reset()
    return this.loadRecommendComics()
  }

  public eps = PromiseContent.withResolvers<bika.comic.Ep[]>()
  public setEps(eps: bika.comic.Ep[]) {
    this.eps.resolve(eps)
  }
  public async loadEps() {
    this.eps.reset()
    try {
      this.eps.content.isLoading.value = true
      const info = await bika.api.comic.getComicEps(this.comicId)
      this.setEps(info)
    } catch {
      this.eps.reject()
    }
  }
  public reloadEpsFromNet() {
    this.eps.reset()
    return this.loadEps()
  }

  public pid = PromiseContent.withResolvers<number>()
  public setPid(pid: number) {
    this.pid.resolve(pid)
  }
  public async loadPid() {
    this.pid.reset()
    try {
      this.pid.content.isLoading.value = true
      const info = await bika.api.comic.getComicPicId(this.comicId)
      this.setPid(info)
    } catch {
      this.pid.reject()
    }
  }
  public reloadPidFromNet() {
    this.pid.reset()
    return this.loadPid()
  }

  public veiled = shallowRef(true)

  public loadAll() {
    console.log('loadAll called', this.detail.content.isLoading.value, this.eps.content.isLoading.value, this.recommendComics.content.isLoading.value, this.pid.content.isLoading.value)
    if (!this.veiled.value) return
    return Promise.any<boolean | void>([
      !this.detail.content.data.value && !this.detail.content.isLoading.value && this.loadDetailFromNet(),
      !this.eps.content.data.value && !this.eps.content.isLoading.value && this.loadEps(),
      !this.recommendComics.content.data.value && !this.recommendComics.content.isLoading.value && this.loadRecommendComics(),
      !this.pid.content.data.value && !this.pid.content.isLoading.value && this.loadPid()
    ])
  }
  public reloadAll() {
    this.veiled.value = true
    return Promise.any<void>([
      this.reloadDetailFromNet(),
      this.reloadEpsFromNet(),
      this.reloadRecommendComicsFromNet(),
      this.reloadPidFromNet()
    ])
  }
}