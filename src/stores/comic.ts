import { defineStore } from 'pinia'
import { computed, ref, shallowReactive, shallowRef } from 'vue'
import { isBoolean } from 'lodash-es'
import { PromiseContent } from '@/utils/data'
import { bika } from '@/api/bika'
export type PreloadValue = bika.comic.BaseComic | undefined

export const useComicStore = defineStore('comic', () => {
  const pageHistory = shallowReactive(new Map<string, ComicPage>())
  const $load = (id: string, preload?: PreloadValue | false) => {
    if (pageHistory.has(id)) {
      now.value = pageHistory.get(id)!
      console.log('page cache hit', now.value)
    } else {
      now.value = new ComicPage(preload, id, false)
      pageHistory.set(id, now.value)
      console.log('page cache miss', now.value)
    }
    now.value.loadAll()
  }
  const now = shallowRef<ComicPage>()
  return {
    history: pageHistory,
    now,
    $load
  }
})


export class ComicPage {
  constructor(preload: PreloadValue | false, public comicId: string, autoLoad = true) {
    if (isBoolean(preload)) {
      this.veiled.value = false
      return
    }
    if (bika.comic.FullComic.is(preload)) this.setDetail(preload)
    this.preload.value = preload
    if (autoLoad) this.loadAll()
  }
  public preload = ref<PreloadValue>(undefined)
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

  public eps = PromiseContent.withResolvers<bika.comic.ComicEp[]>()
  public setEps(eps: bika.comic.ComicEp[]) {
    this.eps.resolve(eps)
  }
  public async loadEps() {
    this.eps.reset()
    try {
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

  public static of(v: ComicPage) {
    return new ComicPage(v.veiled.value && v.union.value, v.comicId)
  }
}