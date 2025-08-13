import { createClassFromResponseStream, PromiseContent, Stream } from "@/utils/data"
import type { bika as BikaType } from '..'
import { importBika } from "./utils"

export namespace _bikaApiComment {

  export const likeComment = PromiseContent.fromAsyncFunction((id: string, signal?: AbortSignal) => importBika(async bika => (await bika.api.pica.rest.post<{ action: 'like' | 'unlike' }>(`/comments/${id}/like`, {}, { signal, allowEmpty: true })).data.action))
  export const reportComment = PromiseContent.fromAsyncFunction((id: string, signal?: AbortSignal) => importBika(async bika => (await bika.api.pica.rest.post<never>(`/comments/${id}/report`, {}, { signal, allowEmpty: true }))))
  export const sendComment = PromiseContent.fromAsyncFunction((id: string, content: string, signal?: AbortSignal) => importBika(async bika => (await bika.api.pica.rest.post<never>(`/comics/${id}/comments`, { content }, { signal, allowEmpty: true }))))
  export const sendChildComment = PromiseContent.fromAsyncFunction((id: string, content: string, signal?: AbortSignal) => importBika(async bika => (await bika.api.pica.rest.post<never>(`/comments/${id}`, { content }, { signal, allowEmpty: true }))))

  export const getComments = PromiseContent.fromAsyncFunction((from: 'games' | 'comics', sourceId: string, page: number, signal?: AbortSignal) => importBika(async bika => {
    const { comments, topComments } = (await bika.api.pica.rest.get<{
      comments: BikaType.api.pica.RawStream<BikaType.comment.RawComment>
      topComments: BikaType.comment.RawComment[]
    }>(`/${from}/${sourceId}/comments?page=${page}`, { signal })).data
    if (page == 1) comments.docs.unshift(...topComments)
    const newComments: BikaType.api.pica.RawStream<BikaType.comment.Comment> = {
      ...comments,
      docs: comments.docs.map(c => new bika.comment.Comment(c))
    }
    return newComments
  }))

  export const createCommentsStream = (sourceId: string, from: 'games' | 'comics' = 'comics') => Stream.bikaApiPackager((page, signal) => getComments(from, sourceId, page, signal))


  export const getChildComments = PromiseContent.fromAsyncFunction((parentId: string, page: number, signal?: AbortSignal) => importBika(bika => createClassFromResponseStream(bika.api.pica.rest.get<{ comments: BikaType.api.pica.RawStream<BikaType.comment.RawChildComment> }>(`/comments/${parentId}/childrens?page=${page}`, { signal }), bika.comment.ChildComment, 'comments')))
  export const createChildCommentsStream = (parentId: string) => Stream.bikaApiPackager((page, signal) => getChildComments(parentId, page, signal))

  export const getMyComment = PromiseContent.fromAsyncFunction((page: number, signal?: AbortSignal) => importBika(bika => createClassFromResponseStream(bika.api.pica.rest.get<{ comments: BikaType.api.pica.RawStream<BikaType.comment.RawMyComment> }>(`/users/my-comments?page=${page}`, { signal }), bika.comment.MyComment, 'comments')))
  export const createMyCommentsStream = () => Stream.bikaApiPackager((page, signal) => getMyComment(page, signal))
}