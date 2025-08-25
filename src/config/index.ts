import { defineStore } from "pinia"
import { useLocalStorage, usePreferredDark } from "@vueuse/core"
import symbol from "@/symbol"
import { computed } from "vue"
import type { bika } from "@/api/bika"
import bikaProxy from "@/api/bika/proxy.json"
import jmProxy from "@/api/jm/proxy.json"
import cosavProxy from '@/api/cosav/proxy.json'
import type { jm } from "@/api/jm"
import type { cosav } from "@/api/cosav"
const defaultConfig = {
  'app.read.preloadImageNumbers': 2,
  'app.read.watchFullscreen': true,
  'app.read.twoImage': false,
  'app.search.showAIProject': true,
  'app.darkMode': false,

  'bika.search.sort': <bika.SortType>'dd',
  'bika.read.imageQuality': <bika.ImageQuality>'original',
  "bika.proxy.interfaceId": bikaProxy.interface[0].id,
  "bika.proxy.image": bikaProxy.image[0],

  'jm.search.sort': <jm.SortType>'',
  'jm.proxy.middle': jmProxy.middle[0],
  'jm.proxy.interface': jmProxy.backUp[0],
  "jm.proxy.resource": jmProxy.resource[0],

  'cosav.search.sort': <cosav.SortType>'',
  'cosav.proxy.middle': cosavProxy.middle[0],
  'cosav.proxy.interface': cosavProxy.backUp[0],
  "cosav.proxy.resource": cosavProxy.resource[0],
  'cosav.lineIndex': 0,

}
export type ConfigType = typeof defaultConfig
export const useConfig = defineStore('config', () => {
  const config = useLocalStorage(symbol.config, defaultConfig)
  console.log('config setup', config.value)
  const isSystemDark = usePreferredDark()
  const isDark = computed(() => config.value['app.darkMode'] || isSystemDark.value)

  return { ...config.value, isDark }
})