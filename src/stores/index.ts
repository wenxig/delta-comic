import type { LoginData } from '@/api/bika/api/auth'
import { createMyCommentsStream } from '@/api/bika/api/comment'
import { getCategories, getCollections, getHotTags, getLevelboard } from '@/api/bika/api/search'
import { createFavouriteComicStream, getProfile } from '@/api/bika/api/user'
import type { Category, Collection, Levelboard } from '@/api/bika/search'
import type { UserProfile } from '@/api/bika/user'
import symbol from '@/symbol'
import { SmartAbortController } from '@/utils/request'
import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { ref, shallowReactive, shallowRef } from 'vue'

export const useBikaStore = defineStore('bika', () => {
  const chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678"
  const nonce = useLocalStorage(
    symbol.loginNonce,
    Array.from({ length: 32 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('').toLowerCase()
  )

  const loginToken = useLocalStorage(symbol.loginToken, '')
  const loginData = useLocalStorage<LoginData>(symbol.loginData, { email: '', password: '' })

  const preload = shallowReactive({
    hotTag: new Array<string>(),
    categories: new Array<Category>(),
    collections: new Array<Collection>()
  })

  const levelboard = shallowRef<Levelboard>({
    comics: [[], [], []],
    users: []
  })

  const user = {
    profile: ref<UserProfile>(),
    favouriteStream: createFavouriteComicStream(),
    commentStream: createMyCommentsStream()
  }

  const preloadSac = new SmartAbortController()
  const $preload = async () => {
    const [hotTags, categories, collections, profile, levelboardValue] = await Promise.all([
      getHotTags(preloadSac.signal),
      getCategories(preloadSac.signal),
      getCollections(preloadSac.signal),
      getProfile(undefined, preloadSac.signal),
      getLevelboard(preloadSac.signal)
    ])
    preload.hotTag = hotTags
    preload.categories = categories
    preload.collections = collections
    user.profile.value = profile
    levelboard.value = levelboardValue
  }
  return { nonce, loginData, loginToken, preload, levelboard, user, $preload }
})