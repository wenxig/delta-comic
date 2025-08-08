import { createClassFromResponseStream, PromiseContent, Stream } from "@/utils/data"
import type { bika as BikaType } from '..'
import { importBika } from "./utils"

export namespace _bikaApiUser {

  export const editSlogan = PromiseContent.fromAsyncFunction((slogan: string, signal?: AbortSignal) => importBika(bika => bika.api.pica.rest.put('/users/profile', { slogan }, { allowEmpty: true, signal })))

  export const getProfile = PromiseContent.fromAsyncFunction(async (uid?: string, signal?: AbortSignal) => await importBika(async bika => {
    if (!uid) return new bika.user.UserProfile((await bika.api.pica.rest.get<{ user: BikaType.user.RawUserProfile }>('/users/profile', { signal })).data.user)
    return new bika.user.UserProfile((await bika.api.pica.rest.get<{ user: BikaType.user.RawUserProfile }>(`/users/${uid}/profile`, { signal })).data.user)
  }))

  export const punch = PromiseContent.fromAsyncFunction((signal?: AbortSignal) => importBika(bika => bika.api.pica.rest.post('/users/punch-in', undefined, { allowEmpty: true, signal })))

  export const editAvatar = PromiseContent.fromAsyncFunction((imageDataUrl: string, signal?: AbortSignal) => importBika(bika => bika.api.pica.rest.put('/users/avatar', {
    allowEmpty: true,
    avatar: imageDataUrl
  }, { signal })))

  export const getFavouriteComic = PromiseContent.fromAsyncFunction((page: number, signal?: AbortSignal) => importBika(bika => createClassFromResponseStream(bika.api.pica.rest.get<{ comics: BikaType.api.pica.RawStream<BikaType.comic.RawLessComic> }>(`/users/favourite?page=${page}`, { signal }), bika.comic.LessComic)))

  export const createFavouriteComicStream = () => Stream.apiPackager<BikaType.comic.LessComic>((page, signal) => getFavouriteComic(page, signal))

}