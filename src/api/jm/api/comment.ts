import { importJm } from "./utils"
import type { jm as JmType } from '..'
import { PromiseContent, Stream } from "@/utils/data"

export namespace _jmApiComment {
  export const getComicComment = PromiseContent.fromAsyncFunction((comicId: number | string, page: number = 1, signal?: AbortSignal) => importJm(async jm => (await jm.api.rest.get<{ list: JmType.comment.RawComment[], total: unknown }>('/forum', {
    params: {
      type: 'manhua',
      page,
      comicId
    },
    signal
  })).list.map(v => new jm.comment.Comment(v))))
  export  const createCommentsStream = (comicId: number | string) => Stream.jmApiPackager((page, signal) => getComicComment(comicId, page, signal))
}