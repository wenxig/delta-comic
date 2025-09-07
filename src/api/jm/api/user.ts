import { PromiseContent, Stream } from "@/utils/data"
import { importJm } from "./utils"
import type { jm as JmType } from '..'
import { useJmStore } from "@/stores"

export namespace _jmApiUser {
  export const buyBadge = PromiseContent.fromAsyncFunction((badgeId: number) => importJm(jm => {
    const jmStore = useJmStore()
    const uid = jmStore.user.profile.data.value?.$uid
    if (!uid) throw new Error('not login')
    return jm.api.rest.post('/coin', {
      uid,
      task_id: badgeId
    })
  }))
  export const createFavouriteStream = () => Stream.jmApiPackager(async (page, signal) => importJm(async jm => {
    const { list } = await jm.api.rest.get<{
      list: JmType.comic.RawCommonComic[],
      folder_list: {
        FID: string
        UID: string
        name: string
      }[],
      total: string
      count: number
    }>('/favorite', { params: { page, folder_id: 0, o: 'mr' }, signal })
    return list.map(v => new jm.comic.CommonComic(v))
  }))
} 