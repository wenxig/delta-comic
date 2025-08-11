import { defineStore } from "pinia"
import { useLocalStorage, usePreferredDark } from "@vueuse/core"
import symbol from "@/symbol"
import { computed } from "vue"
import type { bika } from "@/api/bika"
import bikaProxy from "@/api/bika/proxy.json"
import jmProxy from "@/api/jm/proxy.json"
const defaultConfig = {
  'app.read.preloadImageNumbers': 2,
  'app.read.watchFullscreen': true,
  'app.read.vertical': false,
  'app.read.twoImage': false,
  'app.read.rtl': false,
  'app.search.showAIProject': true,
  'app.darkMode': false,
  'app.smallWindow.enable': false,
  'app.smallWindow.openOnQuit': false,

  'bika.search.sort': <bika.SortType>'dd',
  'bika.read.imageQuality': <bika.ImageQuality>'original',
  'bika.search.fillerTags': new Array<bika.FillerTag>(),
  "bika.proxy.interfaceId": bikaProxy.interface[0].id,
  "bika.proxy.image": bikaProxy.image[0],
  'bika.game.search.fillerTags': new Array<bika.FillerTag>(),

  'jm.proxy.middle': jmProxy.middle[0],
  'jm.proxy.interface': jmProxy.backUp[0],
  "jm.proxy.resource": jmProxy.resource[0],
}
console.log(jmProxy, jmProxy.middle[0])
export type ConfigType = typeof defaultConfig
export const useConfig = defineStore('config', () => {
  const config = useLocalStorage(symbol.config, defaultConfig)
  console.log('config setup', config.value)
  const isSystemDark = usePreferredDark()
  const isDark = computed(() => config.value['app.darkMode'] || isSystemDark.value)

  return { ...config.value, isDark }
})