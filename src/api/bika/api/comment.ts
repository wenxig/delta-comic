import { createClassFromResponseStream, PromiseContent, Stream } from "@/utils/data"
import { picapiRest, type RawStream } from ".."
import { ChildComment, Comment, RawComment, type RawChildComment } from "../comment"

export const likeComment = PromiseContent.fromAsyncFunction(async (id: string, signal?: AbortSignal) => (await picapiRest.post<{ action: 'like' | 'unlike' }>(`/comments/${id}/like`, {}, { signal, allowEmpty: true })).data.action)
export const reportComment = PromiseContent.fromAsyncFunction((id: string, signal?: AbortSignal) => picapiRest.post<never>(`/comments/${id}/report`, {}, { signal, allowEmpty: true }))
export const sendComment = PromiseContent.fromAsyncFunction((id: string, content: string, signal?: AbortSignal) => picapiRest.post<never>(`/comics/${id}/comments`, { content }, { signal, allowEmpty: true }))
export const sendChildComment = PromiseContent.fromAsyncFunction((id: string, content: string, signal?: AbortSignal) => picapiRest.post<never>(`/comments/${id}`, { content }, { signal, allowEmpty: true }))

export const getComments = PromiseContent.fromAsyncFunction(async (from: 'games' | 'comics', sourceId: string, page: number, signal?: AbortSignal) => {
  const { comments, topComments } = (await picapiRest.get<{
    comments: RawStream<RawComment>
    topComments: RawComment[]
  }>(`/${from}/${sourceId}/comments?page=${page}`, { signal })).data
  comments.docs.unshift(...topComments)
  const newComments: RawStream<Comment> = {
    ...comments,
    docs: comments.docs.map(c => new Comment(c))
  }
  return newComments
})

export const createCommentsStream = (sourceId: string, from: 'games' | 'comics' = 'comics') => Stream.apiPackager((page, signal) => getComments(from, sourceId, page, signal))


export const getChildComments = PromiseContent.fromAsyncFunction((parentId: string, page: number, signal?: AbortSignal) => createClassFromResponseStream(picapiRest.get<{ comments: RawStream<RawChildComment> }>(`/comments/${parentId}/childrens?page=${page}`, { signal }), ChildComment, 'comments'))
export const createChildCommentsStream = (parentId: string) => Stream.apiPackager((page, signal) => getChildComments(parentId, page, signal))