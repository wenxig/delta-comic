import { PromiseContent, Stream } from "@/utils/data"
import { importJm } from "./utils"
import type { jm as JmType } from '..'
import { random } from "lodash-es"
import type { _jmComic } from "../comic"
import type { _jmSearch } from "../search"

export namespace _jmApiSearch.utils {
  export const byKeyword = PromiseContent.fromAsyncFunction((searchQuery: string, order: JmType.SortType = "", page = 1, signal?: AbortSignal) =>
    importJm(jm => jm.api.rest.get<JmType.search.ByKeyword>('/search', { signal, params: { search_query: searchQuery, page, o: order } }).then(v => v.content.map(v => new jm.comic.CommonComic(v)))))
  export const createKeywordStream = (searchQuery: string, order: JmType.SortType = "") => Stream.jmApiPackager((page, signal) => byKeyword(searchQuery, order, page, signal))

  export const byCategory = PromiseContent.fromAsyncFunction((c: string, order: JmType.SortType = '', page = 1, signal?: AbortSignal) =>
    importJm(jm => jm.api.rest.get<JmType.search.ByCategory>('/categories/filter', { signal, params: { c, page, o: order } }).then(v => v.content.map(v => new jm.comic.CommonComic(v)))))
  export const createCategoryStream = (c: string, order: JmType.SortType = "") => Stream.jmApiPackager((page, signal) => byCategory(c, order, page, signal))
}

export namespace _jmApiSearch {
  export const getPromote = PromiseContent.fromAsyncFunction((signal?: AbortSignal) =>
    importJm(jm => jm.api.rest.get<JmType.search.RawPromote[]>(`/promote`, { signal, params: { page: 1 } }).then(v => v.map(v => new jm.search.Promote(v)))))
  export const getPromoteItem = PromiseContent.fromAsyncFunction((id: number, page = 1, signal?: AbortSignal) =>
    importJm(jm => jm.api.rest.get<JmType.search.PromoteItem>(`/promote_list`, { signal, params: { page, id } }).then(v => v.list.map(v => new jm.comic.CommonComic(v)))))
  export const createPromoteStream = (id: number) => Stream.jmApiPackager((page, signal) => getPromoteItem(id, page, signal))

  export const getWeekBestList = PromiseContent.fromAsyncFunction((signal?: AbortSignal) => importJm(jm => jm.api.rest.get<JmType.search.WeekBestList>('/week', { signal })))
  export const getWeekBestComic = PromiseContent.fromAsyncFunction((id: number, type: string, signal?: AbortSignal) =>
    importJm(jm => jm.api.rest.get<JmType.search.WeekBestItem>(`/week/filter`, { signal, params: { type, id } }).then(v => v.list.map(v => new jm.comic.CommonComic(v)))))

  export const getRandomComics = PromiseContent.fromAsyncFunction(async (signal?: AbortSignal) => await _jmApiSearch.utils.byCategory('', undefined, random(1, 1145141919810), signal))
  export const createRandomComicStream = () => Stream.jmApiPackager((_page, signal) => getRandomComics(signal))

  let lvb: PromiseLike<[_jmComic.CommonComic[], _jmComic.CommonComic[], _jmComic.CommonComic[]]> | undefined = undefined
  export const getLevelboard = PromiseContent.fromAsyncFunction(async () => {
    if (lvb) {
      const lv = await lvb
      return <_jmSearch.Levelboard>{
        day: lv[0],
        week: lv[1],
        month: lv[2]
      }
    }
    const [today, week, month] = await (lvb = Promise.all([
      _jmApiSearch.utils.byCategory('', 'mv_t'),
      _jmApiSearch.utils.byCategory('', 'mv_w'),
      _jmApiSearch.utils.byCategory('', 'mv_m')
    ]))
    return <_jmSearch.Levelboard>{
      day: today,
      week,
      month
    }
  })
}
