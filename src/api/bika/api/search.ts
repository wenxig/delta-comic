import { createClassFromResponse, createClassFromResponseStream, PromiseContent, Stream } from "@/utils/data"
import { picapiRest, type RawStream, type BKSortType } from ".."
import { CommonComic, LessComic, spiltUsers, type BaseComic, type RawBaseComic, type RawCommonComic, type RawLessComic } from "../comic"
import { type RawCollection, Collection, type RawCategories, Categories } from "../search"
import { uniqBy } from "lodash-es"
import { toCn, toTw } from "@/utils/translator"
export const getHotTags = PromiseContent.fromAsyncFunction(async (signal?: AbortSignal) => (await picapiRest.get<{ keywords: string[] }>("/keywords", { signal })).data.keywords)

export const getRandomComic = PromiseContent.fromAsyncFunction(async (signal?: AbortSignal) => (await picapiRest.get<{ comics: RawCommonComic[] }>(`/comics/random`, { signal })).data.comics.map(v => new CommonComic(v)))

export const createRandomComicStream = () =>
  Stream.create<CommonComic>(async function* (signal, that) {
    while (true) {
      if (that.pages.value <= that.page.value) return
      const result = await getRandomComic(signal)
      that.pages.value = NaN
      that.total.value = NaN
      that.pageSize.value = 20
      that.page.value++
      yield result
    }
  })



export const getCollections = PromiseContent.fromAsyncFunction((signal?: AbortSignal) => createClassFromResponse(picapiRest.get<{ collections: RawCollection[] }>("/collections", { signal }), Collection, 'collections'))

export const getCategories = PromiseContent.fromAsyncFunction((signal?: AbortSignal) => createClassFromResponse(picapiRest.get<{ categories: RawCategories[] }>("/categories", { signal }), Categories, 'categories'))

export namespace search {
  export type SearchResult<T extends RawBaseComic = CommonComic> = RawStream<T>
  export const getComicsByKeyword = PromiseContent.fromAsyncFunction(async (keyword: string, page = 1, sort: BKSortType = 'dd', signal?: AbortSignal): Promise<SearchResult> => {
    const twTag = toTw(keyword)
    const cnTag = toCn(keyword)
    if (twTag == cnTag)
      var data_TW: SearchResult = { docs: [], pages: 0, limit: 0, page: 0, total: 0 }, { data: { comics: data_CN } } = await picapiRest.post<{ comics: SearchResult }>(`/comics/advanced-search?page=${page}&sort=${sort}`, { keyword: cnTag, sort }, { signal })
    else var [{ data: { comics: data_TW } }, { data: { comics: data_CN } }] = await Promise.all([
      picapiRest.post<{ comics: SearchResult }>(`/comics/advanced-search?page=${page}&sort=${sort}`, { keyword: twTag, sort }, { signal }),
      picapiRest.post<{ comics: SearchResult }>(`/comics/advanced-search?page=${page}&sort=${sort}`, { keyword: cnTag, sort }, { signal })
    ])
    const data = uniqBy(data_TW.docs.concat(data_CN.docs), v => v._id).map(v => new CommonComic(v))
    return {
      docs: data,
      total: data.length,
      limit: NaN,
      page,
      pages: Math.max(data_TW.pages, data_CN.pages)
    }
  })
  const createSearchComicStream = <T extends BaseComic>(keyword: string, sort: BKSortType, api: (keyword: string, page?: any, sort?: BKSortType | undefined, signal?: AbortSignal | undefined) => PromiseContent<SearchResult<T>>) => Stream.apiPackager((page, signal) => api(keyword, page, sort, signal))
  export const createKeywordStream = (keyword: string, sort: BKSortType) => createSearchComicStream(keyword, sort, getComicsByKeyword)

  export const getComicsByAuthor = PromiseContent.fromAsyncFunction(async (author: string, page = 1, sort: BKSortType = 'dd', signal?: AbortSignal) => {
    const data = await getComicsByKeyword(author, page, sort, signal)
    data.docs = data.docs.filter(v => spiltUsers(v.author).includes(author.trim()))
    return data
  })
  export const createAuthorStream = (author: string, sort: BKSortType) => createSearchComicStream(author, sort, getComicsByAuthor)

  export const getComicsByTranslator = PromiseContent.fromAsyncFunction(async (translator: string, page = 1, sort: BKSortType = 'dd', signal?: AbortSignal) => {
    const data = await getComicsByKeyword(translator, page, sort, signal)
    data.docs = data.docs.filter(v => spiltUsers(v.chineseTeam).includes(translator.trim()))
    return data
  })
  export const createTranslatorStream = (translator: string, sort: BKSortType) => createSearchComicStream(translator, sort, getComicsByTranslator)

  export const getComicsByUploader = PromiseContent.fromAsyncFunction((id: string, page = 1, sort: BKSortType = 'dd', signal?: AbortSignal) => createClassFromResponseStream(picapiRest.get<{ comics: SearchResult<RawLessComic> }>(`/comics?page=${page}&ca=${id}&s=${sort}`, { signal }), LessComic))
  export const createUploaderStream = (uploader: string, sort: BKSortType) => createSearchComicStream(uploader, sort, getComicsByUploader)

  export const getComicsByCategories = PromiseContent.fromAsyncFunction((category: string, page = 1, sort: BKSortType = 'dd', signal?: AbortSignal) => createClassFromResponseStream(picapiRest.get<{ comics: SearchResult<RawLessComic> }>(`/comics?page=${page}&c=${encodeURIComponent(category)}&s=${sort}`, { signal }), LessComic))
  export const createCategoryStream = (category: string, sort: BKSortType) => createSearchComicStream(category, sort, getComicsByCategories)

  export const getComicsByTag = PromiseContent.fromAsyncFunction((tag: string, page = 1, sort: BKSortType = 'dd', signal?: AbortSignal) => createClassFromResponseStream(picapiRest.get<{ comics: SearchResult<RawLessComic> }>(`/comics?page=${page}&t=${encodeURIComponent(tag)}&s=${sort}`, { signal }), LessComic))
  export const createTagStream = (tag: string, sort: BKSortType) => createSearchComicStream(tag, sort, getComicsByTag)

}