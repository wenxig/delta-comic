import { PromiseContent, Stream } from "@/utils/data"
import { importCosav } from "./utils"
import type { cosav, cosav as CosavType } from '..'
import type { _cosavVideo } from "../video"
import { _cosavSearch } from "../search"
import { random } from "lodash-es"

export namespace _cosavApiSearch.utils {
  export const union = PromiseContent.fromAsyncFunction((params: Record<string, string>, page: number = 0, order: CosavType.SortType = "", signal?: AbortSignal) => importCosav(async cosav => {
    const result = await cosav.api.rest.get<CosavType.RawStream<_cosavVideo.RawCommonVideo>>(`/video/lists`, {
      params: {
        ...params,
        page,
        limit: 30,
        order: order == '' ? undefined : order
      },
      signal
    })
    return {
      ...result,
      list: result.list.map(v => new cosav.video.CommonVideo(v))
    }
  }))

  export const byKeyword = (keyword: string, page: number = 0, sort: cosav.SortType = '', signal?: AbortSignal) => union({ kw: (keyword) }, page, sort, signal)
  export const createKeywordStream = (keyword: string, sort: cosav.SortType = '') => Stream.cosavApiPackager((page, signal) => byKeyword(keyword, page, sort, signal))

  export const byCategory = (category: string, page: number = 0, sort: cosav.SortType = '', signal?: AbortSignal) => union({ ct: (category) }, page, sort, signal)
  export const createCategoryStream = (category: string, sort: cosav.SortType = '') => Stream.cosavApiPackager((page, signal) => byCategory(category, page, sort, signal))

  export const byGroupId = (groupId: string, page: number = 0, sort: cosav.SortType = '', signal?: AbortSignal) => union({ group_id: (groupId) }, page, sort, signal)
  export const createGroupIdStream = (groupId: string, sort: cosav.SortType = '') => Stream.cosavApiPackager((page, signal) => byGroupId(groupId, page, sort, signal))

}
export namespace _cosavApiSearch {
  export const getVideoRecommend = PromiseContent.fromAsyncFunction((signal?: AbortSignal) => importCosav(cosav => cosav.api.rest.get<_cosavVideo.RawCommonVideo[]>('/video/recommend', { signal }).then(v => v.map(v => new cosav.video.CommonVideo(v)))))


  export const getVideoCategories = PromiseContent.fromAsyncFunction((signal?: AbortSignal) => importCosav(cosav => cosav.api.rest.get<_cosavSearch.CategoriesItem[]>('/video/categories', { signal })))
  export const getVideoCategoriesSub = PromiseContent.fromAsyncFunction((ct: string, signal?: AbortSignal) => importCosav(cosav => cosav.api.rest.get<_cosavSearch.CategoriesSubItem[]>(`/video/categories_sub`, { signal, params: { ct } })))

  export const getHotVideo = (page: number = 0, signal?: AbortSignal) => _cosavApiSearch.utils.union({}, page, 'mv', signal)
  export const createVideoHotStream = () => Stream.cosavApiPackager((page, signal) => getHotVideo(page, signal))

  const cRandom = () => {
    const f = random(0, 100)
    return f > 40 ? random(0, 100) : f
  }
  export const getRandomVideo = (signal?: AbortSignal) => _cosavApiSearch.utils.union({}, cRandom(), '', signal).then(v => v.list)
  export const createVideoRandomStream = () => Stream.cosavApiPackager((_, signal) => getHotVideo(cRandom(), signal))

  export const getSettings = PromiseContent.fromAsyncFunction((signal?: AbortSignal) => importCosav(cosav => cosav.api.rest.get<_cosavSearch.RawSettings>('/site/setting', { signal }).then(setting => new _cosavSearch.Settings(setting))))
}
