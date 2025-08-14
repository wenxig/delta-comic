import { PromiseContent, Stream } from "@/utils/data"
import { importJm } from "./utils"
import type { jm as JmType } from '..'
import { random } from "lodash-es"

export namespace _jmApiSearch {
  export const getPromote = PromiseContent.fromAsyncFunction((signal?: AbortSignal) =>
    importJm(jm => jm.api.rest.get<JmType.search.RawPromote[]>(`/promote`, { signal, params: { page: 1 } }).then(v => v.map(v => new jm.search.Promote(v)))))
  export const getPromoteItem = PromiseContent.fromAsyncFunction((id: number, page = 1, signal?: AbortSignal) =>
    importJm(jm => jm.api.rest.get<JmType.search.PromoteItem>(`/promote_list`, { signal, params: { page, id } }).then(v => v.list.map(v => new jm.comic.CommonComic(v)))))
  export const createPromoteStream = (id: number) => Stream.jmApiPackager((page, signal) => getPromoteItem(id, page, signal))

  export const getWeekBestList = PromiseContent.fromAsyncFunction((signal?: AbortSignal) => importJm(jm => jm.api.rest.get<JmType.search.WeekBestList>('/week', { signal })))
  export const getWeekBestComic = PromiseContent.fromAsyncFunction((id: number, type: string, page = 0, signal?: AbortSignal) =>
    importJm(jm => jm.api.rest.get<JmType.search.WeekBestItem>(`/week/filter`, { signal, params: { type, page, id } }).then(v => v.list.map(v => new jm.comic.CommonComic(v)))))
  export const createWeekBestComicStream = (id: number, type: string) => Stream.jmApiPackager((page, signal) => getWeekBestComic(id, type, page, signal))

  export const getRandomComics = PromiseContent.fromAsyncFunction((signal?: AbortSignal) =>
    importJm(jm => jm.api.rest.get<JmType.comic.RawCommonComic[]>('/random_recommend', { signal, params: { page: random(1, 10000000) } }).then(v => v.map(v => new jm.comic.CommonComic(v)))))
  export const createRandomComicStream = () => Stream.jmApiPackager((_page, signal) => getRandomComics(signal))
}