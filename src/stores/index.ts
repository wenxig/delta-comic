import { bika } from '@/api/bika'
import { cosav } from '@/api/cosav'
import { jm } from '@/api/jm'
import symbol from '@/symbol'
import { PromiseContent, type RPromiseContent } from '@/utils/data'
import { useLocalStorage } from '@vueuse/core'
import { isEmpty } from 'lodash-es'
import { defineStore } from 'pinia'
import { shallowReactive } from 'vue'

export const useBikaStore = defineStore('bika', helper => {
  const chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678"
  const nonce = useLocalStorage(
    symbol.loginNonce,
    Array.from({ length: 32 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('').toLowerCase()
  )

  const loginToken = useLocalStorage(symbol.loginTokenBika, '')
  const loginData = useLocalStorage<bika.auth.LoginData>(symbol.loginDataBika, { email: '', password: '' })

  const preload = shallowReactive({
    hotTag: bika.api.search.getHotTags(),
    categories: bika.api.search.getCategories(),
    collections: bika.api.search.getCollections()
  })

  const levelboard = PromiseContent.withResolvers<bika.search.Levelboard>(true)
  const $loadLevelboard = helper.action(async () => levelboard.resolve(await bika.api.search.getLevelboard()), 'loadLevelboard')
  const user = shallowReactive({
    profile: bika.api.user.getProfile(undefined),
    $reloadProfile: () => user.profile = bika.api.user.getProfile(undefined),
    favouriteStream: bika.api.user.createFavouriteComicStream(),
    commentStream: bika.api.comment.createMyCommentsStream()
  })

  return { nonce, loginData, loginToken, preload, $loadLevelboard, levelboard: levelboard.content, user }
})

export const useJmStore = defineStore('jm', helper => {
  const loginToken = useLocalStorage(symbol.loginTokenJm, '')
  const loginAVS = useLocalStorage(symbol.loginAvsJm, '')
  const loginData = useLocalStorage<jm.auth.LoginData>(symbol.loginDataJm, { username: '', password: '' })

  const preload = shallowReactive({
    promote: jm.api.search.getPromote(),
    weekBest: jm.api.search.getWeekBestList(),
  })
  const userProfileController = PromiseContent.withResolvers<jm.user.UserMe>()
  const $loadProfile = helper.action(async (data?: jm.user.UserMe) => userProfileController.resolve(data ?? await jm.api.auth.login(loginData.value)), 'loadProfile')
  const user = shallowReactive({
    profile: userProfileController.content
  })
  if (!isEmpty(loginData.value.password)) $loadProfile()

  const levelboard = PromiseContent.withResolvers<jm.search.Levelboard>(true)
  const $loadLevelboard = helper.action(async () => levelboard.resolve(await jm.api.search.getLevelboard()), 'loadLevelboard')

  return { preload, user, loginToken, loginAVS, loginData, $loadProfile, $loadLevelboard, levelboard: levelboard.content, userProfileController }
})

export const useCosavStore = defineStore('cosav', helper => {
  const preload = shallowReactive({
    categories: cosav.api.search.getVideoCategories()
  })

  return { preload, }
})