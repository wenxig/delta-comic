import { createClassFromResponse, createClassFromResponseStream, PromiseContent, Stream } from "@/utils/data"
import localforage from "localforage"
import { flatten, times, sortBy } from "lodash-es"
import type { bika as BikaType } from '..'
import { importBika } from "./utils"
import { useConfig } from "@/config"
export namespace _bikaApiComic {

  export type ResultActionData<T extends string> = { action: T }
  export const likeComic = PromiseContent.fromAsyncFunction((id: string, signal?: AbortSignal) => importBika(bika => bika.api.pica.rest.post<ResultActionData<'like' | 'unlike'>>(`/comics/${id}/like`, {}, { signal })))
  export const favouriteComic = PromiseContent.fromAsyncFunction((id: string, signal?: AbortSignal) => importBika(bika => bika.api.pica.rest.post<ResultActionData<'favourite' | 'un_favourite'>>(`/comics/${id}/favourite`, {}, { signal })))

  const infoStore = new Map<string, BikaType.comic.FullComic | false>()
  export const getComicInfo = PromiseContent.fromAsyncFunction((id: string, signal?: AbortSignal) => importBika(async bika => {
    if (infoStore.has(id)) return infoStore.get(id)!
    const data = (await bika.api.pica.rest.get<{ comic: BikaType.comic.RawFullComic } | false>(`/comics/${id}`, { signal }))
    if (data.data) infoStore.set(id, new bika.comic.FullComic(data.data.comic))
    else infoStore.set(id, false)
    return infoStore.get(id)!
  }))

  const picIdStore = new Map<string, number>()
  export const getComicPicId = PromiseContent.fromAsyncFunction((id: string, signal?: AbortSignal) => importBika(async bika => {
    if (picIdStore.has(id)) return picIdStore.get(id)!
    const result = await bika.api.recommend.rest.get<{ shareId: number }>(`/pic/share/set/?c=${id}`, { signal })
    const picId = result.shareId
    picIdStore.set(id, picId)
    return picId
  }))

  export const getComicIdByPicId = PromiseContent.fromAsyncFunction((picId: string, signal?: AbortSignal) => importBika(async bika => {
    const result = await bika.api.recommend.rest.get<{ cid: string }>(`/pic/share/get/?shareId=${picId}`, { signal })
    const id = result.cid
    return id
  }))

  export const getComicByPicId = PromiseContent.fromAsyncFunction(async (picId: string, signal?: AbortSignal) => {
    const id = await getComicIdByPicId(picId, signal)
    const data = await getComicInfo(id, signal)
    return data
  })

  export const getRecommendComics = PromiseContent.fromAsyncFunction((id: string, signal?: AbortSignal) => importBika(async bika => createClassFromResponse(bika.api.pica.rest.get<{ comics: BikaType.comic.RawLessComic[] }>(`/comics/${id}/recommendation`, { signal }), bika.comic.LessComic, 'comics')))


  export const getComicEps = PromiseContent.fromAsyncFunction((async (id: string): Promise<BikaType.comic.Ep[]> => importBika(async bika => {
    const stream = Stream.bikaApiPackager(async (page, signal) => (await bika.api.pica.rest.get<{ eps: BikaType.api.pica.RawStream<BikaType.comic.RawComicEp> }>(`/comics/${id}/eps?page=${page}`, { signal })).data.eps)
    const eps = await stream.nextToDone()
    return eps.map(ep => new bika.comic.Ep(ep))
  })))

  type Pages = BikaType.api.pica.RawStream<BikaType.comic.RawPage>
  const comicsPagesDB = localforage.createInstance({ name: 'comic-page' })
  export const getComicPage = async (id: string, index: number, page: number, signal?: AbortSignal) => await importBika(bika => createClassFromResponseStream(bika.api.pica.rest.get<{ pages: Pages }>(`/comics/${id}/order/${index}/pages?page=${page}`, { signal }), bika.comic.Page, 'pages'))
  export const clearComicPagesTemp = () => comicsPagesDB.clear()
  const comicPageRequesting = new Map<string, Promise<BikaType.comic.Page[]>>()
  export const getComicPages = (async (id: string, index: number, signal?: AbortSignal) => importBika(async bika => {
    await comicsPagesDB.ready()
    const config = useConfig()
    const key = id + '|' + index + '|' + config["bika.read.imageQuality"]
    const pageDB = await comicsPagesDB.getItem<Pages[]>(key)
    if (pageDB) return flatten(pageDB.map(v => v.docs.map(v => new bika.comic.Page(v))))
    if (comicPageRequesting.has(key)) return comicPageRequesting.get(key)!
    const _pages = new Promise<BikaType.comic.Page[]>(async r => {
      const firstPage = await getComicPage(id, index, 1, signal)
      const otherPages = new Array<BikaType.api.pica.RawStream<BikaType.comic.Page>>()
      otherPages.push(firstPage)
      otherPages.push(...await Promise.all(times(firstPage.pages - 1, i => getComicPage(id, index, i + 2, signal))))
      const pages = flatten(sortBy(otherPages, 'page').map(v => v.docs.map(v => new bika.comic.Page(v))))
      r(pages)
      await comicsPagesDB.setItem<Pages[]>(key, sortBy(otherPages, 'page'))
    })
    comicPageRequesting.set(key, _pages)
    const pages = await _pages
    comicPageRequesting.delete(key)
    return pages
  }))
  export const createComicEpPageStream = (comicId: string, epIndex: number) => Stream.bikaApiPackager((page, signal) => getComicPage(comicId, epIndex, page, signal))
}