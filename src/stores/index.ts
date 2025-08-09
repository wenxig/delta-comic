import { bika } from '@/api/bika'
import symbol from '@/symbol'
import { PromiseContent } from '@/utils/data'
import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { shallowReactive, reactive, ref, triggerRef, shallowRef } from 'vue'

export const useBikaStore = defineStore('bika', () => {
  const chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678"
  const nonce = useLocalStorage(
    symbol.loginNonce,
    Array.from({ length: 32 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('').toLowerCase()
  )

  const loginToken = useLocalStorage(symbol.loginToken, '')
  const loginData = useLocalStorage<bika.api.auth.LoginData>(symbol.loginData, { email: '', password: '' })

  const preload = reactive({
    hotTag: bika.api.search.getHotTags(),
    categories: bika.api.search.getCategories(),
    collections: bika.api.search.getCollections()
  })

  const levelboard = shallowRef(new PromiseContent(new Promise<bika.search.Levelboard>(() => { })))
  let isLoadLevelboard = false
  const $loadLevelboard = () => isLoadLevelboard || (isLoadLevelboard = true) && (levelboard.value = bika.api.search.getLevelboard())
  const user = shallowReactive({
    profile: bika.api.user.getProfile(undefined),
    $reloadProfile: () => user.profile = bika.api.user.getProfile(undefined),
    favouriteStream: bika.api.user.createFavouriteComicStream(),
    commentStream: bika.api.comment.createMyCommentsStream()
  })

  return { nonce, loginData, loginToken, preload, levelboard, $loadLevelboard, user }
})