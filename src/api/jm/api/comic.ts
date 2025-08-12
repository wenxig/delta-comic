import { importJm } from "./utils"
import type { jm as JmType } from '..'
import { PromiseContent } from "@/utils/data"
import localforage from "localforage"
export namespace _jmApiComic {
  export const getComic = PromiseContent.fromAsyncFunction((id: string | number, signal?: AbortSignal) => importJm(async jm => {
    const comic = new jm.comic.FullComic(await jm.api.rest.get<JmType.comic.RawFullComic>(`/album?id=${id}`, { signal }))
    if (comic.$series_id != 0 && comic.$series_id != Number(id)) {
      return new jm.comic.FullComic(await jm.api.rest.get<JmType.comic.RawFullComic>(`/album?id=${comic.$series_id}`, { signal }))
    }
    return comic
  }))

  const comicsPagesDB = localforage.createInstance({ name: 'comic-page' })
  export const getComicPages = PromiseContent.fromAsyncFunction((id: string | number, signal?: AbortSignal) => importJm(async jm => {
    await comicsPagesDB.ready()
    const key = id + '@jm'
    const pageDB = await comicsPagesDB.getItem<JmType.comic.RawLessComic>(key)
    if (pageDB) var _chapter = pageDB
    else var _chapter = await jm.api.rest.get<JmType.comic.RawLessComic>(`/chapter?id=${id}`, { signal })
    const chapter = new jm.comic.LessComic(_chapter)
    const imgs = chapter.$images.map(img => {
      const page = Number(img.rawUrl.match(/\d+/g)?.[0])
      return new jm.image.Image(`/media/photos/${id}/${img.rawUrl}`, chapter.$id, page)
    })
    await comicsPagesDB.setItem(key, _chapter)
    return imgs
  }))

  export const likeComic = PromiseContent.fromAsyncFunction((id: string | number, signal?: AbortSignal) => importJm(jm => jm.api.rest.postForm('/like', { id }, { signal })))
}