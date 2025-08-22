import { PromiseContent } from "@/utils/data"
import { importJm } from "./utils"
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
}