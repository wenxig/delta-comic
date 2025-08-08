import { bika } from '@/api/bika'
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
  const loginData = useLocalStorage<bika.api.auth.LoginData>(symbol.loginData, { email: '', password: '' })

  const preload = shallowReactive({
    hotTag: new Array<string>(),
    categories: new Array<bika.search.Category>(),
    collections: new Array<bika.search.Collection>()
  })

  const levelboard = shallowRef<bika.search.Levelboard>({
    comics: [[], [], []],
    users: []
  })

  const user = {
    profile: ref<bika.user.UserProfile>(),
    $reloadProfile: () => bika.api.user.getProfile(undefined, preloadSac.signal).then(d => user.profile.value = d),
    favouriteStream: bika.api.user.createFavouriteComicStream(),
    commentStream: bika.api.comment.createMyCommentsStream()
  }

  const preloadSac = new SmartAbortController()
  const $preload = async () => {
    const [hotTags, categories, collections, profile, levelboardValue] = await Promise.all([
      bika.api.search.getHotTags(preloadSac.signal),
      bika.api.search.getCategories(preloadSac.signal),
      bika.api.search.getCollections(preloadSac.signal),
      bika.api.user.getProfile(undefined, preloadSac.signal),
      bika.api.search.getLevelboard(preloadSac.signal)
    ])
    preload.hotTag = hotTags
    preload.categories = categories
    preload.collections = collections
    user.profile.value = profile
    levelboard.value = levelboardValue
  }
  return { nonce, loginData, loginToken, preload, levelboard, user, $preload }
})