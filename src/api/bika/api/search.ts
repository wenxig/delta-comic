import { createClassFromResponse, createClassFromResponseStream, PromiseContent, Stream } from "@/utils/data"
import type { bika as BikaType } from '..'
import { importBika } from "./utils"
import { uniqBy } from "lodash-es"
import { toCn, toTw } from "@/utils/translator"

export namespace _bikaApiSearch {

  export const getHotTags = PromiseContent.fromAsyncFunction((signal?: AbortSignal) => importBika(async bika => (await bika.api.pica.rest.get<{ keywords: string[] }>("/keywords", { signal })).data.keywords))

  export const getRandomComic = PromiseContent.fromAsyncFunction((signal?: AbortSignal) => importBika(async bika => (await bika.api.pica.rest.get<{ comics: BikaType.comic.RawCommonComic[] }>(`/comics/random`, { signal })).data.comics.map(v => new bika.comic.CommonComic(v))))

  export const createRandomComicStream = () =>
    Stream.create<BikaType.comic.CommonComic>(async function* (signal, that) {
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



  export const getCollections = PromiseContent.fromAsyncFunction((signal?: AbortSignal) => importBika(bika => createClassFromResponse(bika.api.pica.rest.get<{ collections: BikaType.search.RawCollection[] }>("/collections", { signal }), bika.search.Collection, 'collections')))

  export const getCategories = PromiseContent.fromAsyncFunction((signal?: AbortSignal) => importBika(bika => createClassFromResponse(bika.api.pica.rest.get<{ categories: BikaType.search.RawCategory[] }>("/categories", { signal }), bika.search.Category, 'categories')))

  let lvb: Promise<[BikaType.api.pica.Response<{
    comics: BikaType.comic.RawLessComic[]
  }>, BikaType.api.pica.Response<{
    comics: BikaType.comic.RawLessComic[]
  }>, BikaType.api.pica.Response<{
    comics: BikaType.comic.RawLessComic[]
  }>, BikaType.api.pica.Response<{
    users: BikaType.user.RawKnight[]
  }>]> | undefined = undefined
  export const getLevelboard = PromiseContent.fromAsyncFunction(async (signal?: AbortSignal) => await importBika(async bika => {
    if (lvb) {
      var _levelData = lvb
    } else {
      var _levelData = lvb = Promise.all([
        bika.api.pica.rest.get<{ comics: BikaType.comic.RawLessComic[] }>('/comics/leaderboard?tt=H24&ct=VC', { signal }),
        bika.api.pica.rest.get<{ comics: BikaType.comic.RawLessComic[] }>('/comics/leaderboard?tt=D7&ct=VC', { signal }),
        bika.api.pica.rest.get<{ comics: BikaType.comic.RawLessComic[] }>('/comics/leaderboard?tt=D30&ct=VC', { signal }),
        bika.api.pica.rest.get<{ users: BikaType.user.RawKnight[] }>('/comics/knight-leaderboard', { signal })
      ] as const)
    }
    const levelData = await _levelData
    return <BikaType.search.Levelboard>{
      comics: (levelData.slice(0, 3)).map(v => (<{ comics: BikaType.comic.RawLessComic[] }>v.data).comics.map(v => new bika.comic.LessComic(v))),
      users: levelData[3].data.users.map(v => new bika.user.Knight(v))
    }
  }))
}
export namespace _bikaApiSearch.utils {
  export type SearchResult<T extends BikaType.comic.RawBaseComic = BikaType.comic.CommonComic> = BikaType.api.pica.RawStream<T>
  export const getComicsByKeyword = PromiseContent.fromAsyncFunction(async (keyword: string, page = 1, sort: BikaType.SortType = 'dd', signal?: AbortSignal): Promise<SearchResult> => await importBika(async bika => {
    const twTag = toTw(keyword)
    const cnTag = toCn(keyword)
    if (twTag == cnTag)
      var data_TW: SearchResult = { docs: [], pages: 0, limit: 0, page: 0, total: 0 }, { data: { comics: data_CN } } = await bika.api.pica.rest.post<{ comics: SearchResult }>(`/comics/advanced-search?page=${page}&sort=${sort}`, { keyword: cnTag, sort }, { signal })
    else var [{ data: { comics: data_TW } }, { data: { comics: data_CN } }] = await Promise.all([
      bika.api.pica.rest.post<{ comics: SearchResult }>(`/comics/advanced-search?page=${page}&sort=${sort}`, { keyword: twTag, sort }, { signal }),
      bika.api.pica.rest.post<{ comics: SearchResult }>(`/comics/advanced-search?page=${page}&sort=${sort}`, { keyword: cnTag, sort }, { signal })
    ])
    const data = uniqBy(data_TW.docs.concat(data_CN.docs), v => v._id).map(v => new bika.comic.CommonComic(v))
    return {
      docs: data,
      total: data.length,
      limit: NaN,
      page,
      pages: Math.max(data_TW.pages, data_CN.pages)
    }
  }))
  const createSearchComicStream = <T extends BikaType.comic.BaseComic>(keyword: string, sort: BikaType.SortType, api: (keyword: string, page?: any, sort?: BikaType.SortType | undefined, signal?: AbortSignal | undefined) => PromiseContent<SearchResult<T>>) => Stream.bikaApiPackager((page, signal) => api(keyword, page, sort, signal))
  export const createKeywordStream = (keyword: string, sort: BikaType.SortType) => createSearchComicStream(keyword, sort, getComicsByKeyword)

  export const createAuthorStream = (author: string, sort: BikaType.SortType) => createSearchComicStream(author, sort, getComicsByKeyword)

  export const createTranslatorStream = (translator: string, sort: BikaType.SortType) => createSearchComicStream(translator, sort, getComicsByKeyword)

  export const getComicsByUploader = PromiseContent.fromAsyncFunction((id: string, page = 1, sort: BikaType.SortType = 'dd', signal?: AbortSignal) => importBika(bika => createClassFromResponseStream(bika.api.pica.rest.get<{ comics: SearchResult<BikaType.comic.RawLessComic> }>(`/comics?page=${page}&ca=${(id)}&s=${sort}`, { signal }), bika.comic.LessComic)))
  export const createUploaderStream = (uploader: string, sort: BikaType.SortType) => createSearchComicStream(uploader, sort, getComicsByUploader)

  export const getComicsByCategories = PromiseContent.fromAsyncFunction((category: string, page = 1, sort: BikaType.SortType = 'dd', signal?: AbortSignal) => importBika(bika => createClassFromResponseStream(bika.api.pica.rest.get<{ comics: SearchResult<BikaType.comic.RawLessComic> }>(`/comics?page=${page}&c=${(category)}&s=${sort}`, { signal }), bika.comic.LessComic)))
  export const createCategoryStream = (category: string, sort: BikaType.SortType) => createSearchComicStream(category, sort, getComicsByCategories)

  export const getComicsByTag = PromiseContent.fromAsyncFunction((tag: string, page = 1, sort: BikaType.SortType = 'dd', signal?: AbortSignal) => importBika(bika => createClassFromResponseStream(bika.api.pica.rest.get<{ comics: SearchResult<BikaType.comic.RawLessComic> }>(`/comics?page=${page}&t=${(tag)}&s=${sort}`, { signal }), bika.comic.LessComic)))
  export const createTagStream = (tag: string, sort: BikaType.SortType) => createSearchComicStream(tag, sort, getComicsByTag)

}
