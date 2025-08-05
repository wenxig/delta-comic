import type { BaseComic, CommonComic } from "@/api/bika/comic"
import type { ChildComment, Comment } from "@/api/bika/comment"
import type { RStream, Stream } from "@/utils/data"
import { reactive, shallowRef } from "vue"

export type SearchStreamType = Stream<BaseComic>
export const searchResult = new Map<string, SearchStreamType>()
export const searchListScrollPosition = new Map<string, number>()


export const random = {
  stream: <undefined | RStream<CommonComic>>undefined,
  scroll: 0,
  size: reactive(new Map<BaseComic, number>())
}

export const userPageScroll = {
  history: 0,
  favourite: 0,
  image: 0,
  comment: 0
}
export const isShowSetupPage = shallowRef(false)

export const brushComic = {
  comicIndex: 0,
  page: 0
}

export const image = reactive({
  loaded: new Set<string>(),
  error: new Set<string>()
})

export const comments = new Map<string, Stream<Comment>>()
export const commentsScroll = new Map<string, number>()
export const childrenComments = new Map<string, Stream<ChildComment>>()
export const childrenCommentsScroll = new Map<string, number>()