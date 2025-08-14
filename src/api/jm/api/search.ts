import { PromiseContent, Stream } from "@/utils/data"
import { importJm } from "./utils"
import type { jm as JmType } from '..'

export namespace _jmApiSearch {
  export const getPromote = PromiseContent.fromAsyncFunction((page = 1, signal?: AbortSignal) =>
    importJm(jm => jm.api.rest.get<JmType.search.RawPromote[]>(`/promote`, { signal, params: { page } }).then(v => v.map(v => new jm.search.Promote(v)))))

  export const getWeekBestList = PromiseContent.fromAsyncFunction((signal?: AbortSignal) => importJm(jm => jm.api.rest.get<JmType.search.WeekBestList>('/week', { signal })))
  export const getWeekBestComic = PromiseContent.fromAsyncFunction((id: number, type: string, page = 0, signal?: AbortSignal) =>
    importJm(jm => jm.api.rest.get<JmType.search.WeekBestItem>(`/week/filter`, { signal, params: { type, page, id } }).then(v => v.list.map(v => new jm.comic.CommonComic(v)))))
  export const createWeekBestComicStream = (id: number, type: string) => Stream.jmApiPackager((page, signal) => getWeekBestComic(id, type, page, signal))
}