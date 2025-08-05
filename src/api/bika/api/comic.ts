import type { AxiosRequestConfig } from "axios"
import { createClassFromResponseStream, PromiseContent, Stream } from "@/utils/data"
import { picapiRest, recommendRest, type RawStream } from ".."
import { ComicEp, FullComic, LessComic, Page, type RawComicEp, type RawFullComic, type RawLessComic, type RawPage } from "../comic"
import localforage from "localforage"
import { flatten, times, sortBy } from "lodash-es"

export type ResultActionData<T extends string> = { action: T }
export const likeComic = PromiseContent.fromAsyncFunction(async (id: string, signal?: AbortSignal) => picapiRest.post<ResultActionData<'like' | 'unlike'>>(`/comics/${id}/like`, {}, { signal }))
export const favouriteComic = PromiseContent.fromAsyncFunction(async (id: string, signal?: AbortSignal) => picapiRest.post<ResultActionData<'favourite' | 'un_favourite'>>(`/comics/${id}/favourite`, {}, { signal }))

const infoStore = new Map<string, FullComic | false>()
export const getComicInfo = PromiseContent.fromAsyncFunction(async (id: string, signal?: AbortSignal) => {
  if (infoStore.has(id)) return infoStore.get(id)!
  const data = (await picapiRest.get<{ comic: RawFullComic } | false>(`/comics/${id}`, { signal }))
  if (data.data) infoStore.set(id, new FullComic(data.data.comic))
  else infoStore.set(id, false)
  return infoStore.get(id)!
})

const picIdStore = new Map<string, number>()
export const getComicPicId = PromiseContent.fromAsyncFunction(async (id: string, signal?: AbortSignal) => {
  if (picIdStore.has(id)) return picIdStore.get(id)!
  const result = await recommendRest.get<{ shareId: number }>(`/pic/share/set/?c=${id}`, { signal })
  const picId = result.shareId
  picIdStore.set(id, picId)
  return picId
})

export const getComicIdByPicId = PromiseContent.fromAsyncFunction(async (picId: string, signal?: AbortSignal) => {
  const result = await recommendRest.get<{ cid: string }>(`/pic/share/get/?shareId=${picId}`, { signal })
  const id = result.cid
  return id
})

export const getComicByPicId = PromiseContent.fromAsyncFunction(async (picId: string, signal?: AbortSignal) => {
  const id = await getComicIdByPicId(picId, signal)
  const data = await getComicInfo(id, signal)
  return data
})

export const getRecommendComics = PromiseContent.fromAsyncFunction(async (id: string, signal?: AbortSignal) => (await picapiRest.get<{ comics: RawLessComic[] }>(`/comics/${id}/recommendation`, { signal })).data.comics.map(v => new LessComic(v)))


export const getComicEps = PromiseContent.fromAsyncFunction((async (id: string): Promise<ComicEp[]> => {
  const stream = Stream.apiPackager(async (page, signal) => (await picapiRest.get<{ eps: RawStream<RawComicEp> }>(`/comics/${id}/eps?page=${page}`, { signal })).data.eps)
  const eps = await stream.nextToDone()
  return eps.map(ep => new ComicEp(ep))
}))




type Pages = RawStream<RawPage>
export const getComicPage = (id: string, index: number, page: number, signal?: AbortSignal) => createClassFromResponseStream(picapiRest.get<{ pages: Pages }>(`/comics/${id}/order/${index}/pages?page=${page}`, { signal }), Page, 'pages')
const comicsPagesDB = localforage.createInstance({ name: 'comic-page' })
export const clearComicPagesTemp = () => comicsPagesDB.clear()
const comicPageRequesting = new Map<string, Promise<Page[]>>()
export const getComicPages = (async (id: string, index: number, signal?: AbortSignal) => {
  await comicsPagesDB.ready()
  const key = id + '|' + index
  const pageDB = await comicsPagesDB.getItem<Pages[]>(key)
  if (pageDB) return flatten(pageDB.map(v => v.docs.map(v => new Page(v))))
  if (comicPageRequesting.has(key)) return comicPageRequesting.get(key)!
  const _pages = new Promise<Page[]>(async r => {
    const firstPage = await getComicPage(id, index, 1, signal)
    const otherPages = new Array<RawStream<Page>>()
    otherPages.push(firstPage)
    otherPages.push(...await Promise.all(times(firstPage.pages - 1, i => getComicPage(id, index, i + 2, signal))))
    const pages = flatten(sortBy(otherPages, 'page').map(v => v.docs.map(v => new Page(v))))
    r(pages)
    await comicsPagesDB.setItem<Pages[]>(key, sortBy(otherPages, 'page'))
  })
  comicPageRequesting.set(key, _pages)
  const pages = await _pages
  comicPageRequesting.delete(key)
  return pages
})
export const createComicEpPageStream = (comicId: string, epIndex: number) => Stream.apiPackager((page, signal) => getComicPage(comicId, epIndex, page, signal))