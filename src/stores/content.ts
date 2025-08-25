import { defineStore } from 'pinia'
import { computed, shallowReactive, shallowRef } from 'vue'
import { isBoolean, isNumber } from 'lodash-es'
import { PromiseContent } from '@/utils/data'
import { bika } from '@/api/bika'
import { jm } from '@/api/jm'
import { uni } from '@/api/union'
import { cosav } from '@/api/cosav'

export const useContentStore = defineStore('content', helper => {
  const pageHistory = shallowReactive(new Map<string, ContentPage>())
  const $load = helper.action((type: 'jm' | 'bika' | 'cosav', id: string, preload?: CosavPreloadValue | JmPreloadValue | BikaPreloadValue | uni.comic.Comic<any> | false, load = true) => {
    const storeId = `${id}@${type}`
    if (pageHistory.has(storeId)) {
      now.value = pageHistory.get(storeId)!
      console.log('page cache hit', now.value)
    } else {
      now.value = createContentPage(type, id, preload, false)
      pageHistory.set(storeId, now.value)
      console.log('page cache miss', now.value)
    }
    if (load) now.value.loadAll()
  }, 'load')
  const now = shallowRef<ContentPage>()
  return {
    history: pageHistory,
    now,
    $load
  }
})

export function createContentPage(type: 'jm' | 'bika' | 'cosav', id: string | number, preload?: CosavPreloadValue | BikaPreloadValue | JmPreloadValue | uni.comic.Comic<any>, autoLoad: boolean = false): ContentPage {
  if (type == 'cosav' && (cosav.video.BaseVideo.is(preload) || preload == undefined)) {
    return new CosavContentPage(preload, id.toString())
  }
  if (uni.comic.Comic.is(preload)) preload = preload.$raw
  id = Number.isNaN(Number(id)) ? id : Number(id)
  if (type == 'jm' && (jm.comic.BaseComic.is(preload) || preload == undefined)) {
    return new JmContentPage(preload, Number(id), autoLoad)
  } else if (type == 'bika' && (isBoolean(preload) || bika.comic.BaseComic.is(preload) || preload == undefined)) {
    return new BikaContentPage(preload, id.toString(), autoLoad)
  }
  throw new Error('Invalid id or type')
}
export type ContentPage = BikaContentPage | JmContentPage | CosavContentPage

type CosavPreloadValue = cosav.video.BaseVideo | undefined
export class CosavContentPage {
  constructor(preload: CosavPreloadValue, public videoId: string, autoLoad = true) {
    this.preload.value = preload
    this.pid.resolve(videoId)
    if (cosav.video.FullVideo.is(this.preload.value)) this.setDetail(this.preload.value)
    if (autoLoad) this.loadAll()
  }
  public preload = shallowRef<CosavPreloadValue>(undefined)
  public detail = PromiseContent.withResolvers<cosav.video.FullVideo>()
  public union = computed(() => this.detail.content.data.value ?? this.preload.value)
  public setDetail(video: cosav.video.FullVideo) {
    this.preload.value = video
    this.detail.resolve(video)
    this.recommendVideos.resolve(video.$cnxh)
  }
  public async loadDetailFromNet() {
    this.detail.reset()
    try {
      this.detail.content.isLoading.value = true
      const info = await cosav.api.video.getInfo(this.videoId)
      this.setDetail(info)
    } catch {
      this.detail.reject()
    }
  }
  public reloadDetailFromNet() {
    this.preload.value = undefined
    return this.loadDetailFromNet()
  }
  public recommendVideos = PromiseContent.withResolvers<cosav.video.CommonVideo[]>(true)
  public pid = PromiseContent.withResolvers<string>(true)
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

type JmPreloadValue = jm.comic.BaseComic | undefined
export class JmContentPage {
  constructor(preload: JmPreloadValue, public comicId: number, autoLoad = true) {
    this.preload.value = uni.comic.Comic.is<jm.comic.BaseComic>(preload) ? <JmPreloadValue>preload.$raw : preload
    this.pid.resolve(comicId)
    if (jm.comic.FullComic.is(this.preload.value)) this.setDetail(this.preload.value)
    if (autoLoad) this.loadAll()
  }
  public preload = shallowRef<JmPreloadValue>(undefined)
  public detail = PromiseContent.withResolvers<jm.comic.FullComic>()
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

type BikaPreloadValue = bika.comic.BaseComic | undefined | false
export class BikaContentPage {
  constructor(preload: BikaPreloadValue, public comicId: string, autoLoad = true) {
    const truePreload = uni.comic.Comic.is<bika.comic.BaseComic>(preload) ? <BikaPreloadValue>preload.$raw : preload
    if (isBoolean(truePreload)) {
      this.veiled.value = truePreload
      return
    }
    if (bika.comic.FullComic.is(truePreload)) this.setDetail(truePreload)
    this.preload.value = truePreload
    if (autoLoad) this.loadAll()
  }
  public preload = shallowRef<Exclude<BikaPreloadValue, false>>(undefined)
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