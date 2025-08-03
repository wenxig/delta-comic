import dayjs from "dayjs"
import { defineStore } from "pinia"
import proxyData from '@/api/bika_proxy.json'
import { useLocalStorage, usePreferredDark } from "@vueuse/core"
import symbol from "@/symbol"
import type { BKImageQuality, BKSortType, FillerTag } from "@/api/bika"
import { computed } from "vue"
const defaultConfig = {
  'bika.read.preloadImageNumbers': 2,
  'bika.read.watchFullscreen': true,
  'bika.read.vertical': false,
  'bika.read.twoImage': false,
  'bika.read.rtl': false,
  'bika.read.imageQuality': <BKImageQuality>'original',
  'bika.search.sort': <BKSortType>'dd',
  'bika.search.fillerTags': new Array<FillerTag>(),
  'bika.search.showAIProject': true,
  "bika.proxy.interfaceId": proxyData.interface[0].id,
  "bika.proxy.image": proxyData.image[0],
  'bika.subscribe.updateTime': dayjs().format("YYYY-MM-DD"),
  'bika.info.unsortComic': false,
  'bika.darkMode': false,
  'bika.game.search.fillerTags': new Array<FillerTag>(),
  'bika.smallWindow.enable': false,
  'bika.smallWindow.openOnQuit': false,
}
export type ConfigType = typeof defaultConfig
export const useConfig = defineStore('config', () => {
  const config = useLocalStorage(symbol.config, defaultConfig)
  console.log('config setup', config.value)
  const isSystemDark = usePreferredDark()
  const isDark = computed(() => config.value['bika.darkMode'] || isSystemDark.value)

  return { ...config.value, isDark }
})