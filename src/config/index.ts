import { defineStore } from "pinia"
import { useLocalStorage, usePreferredDark } from "@vueuse/core"
import symbol from "@/symbol"
import { computed } from "vue"
import { defaultsDeep } from "lodash-es"
import { Device } from '@capacitor/device'
import { Capacitor } from "@capacitor/core"
const defaultConfig = {
  'app.read.preloadImageNumbers': 2,
  'app.read.watchFullscreen': true,
  'app.read.twoImage': false,
  'app.search.showAIProject': true,
  'app.darkMode': false,
  "app.recordHistory": true,

}
export type ConfigType = typeof defaultConfig
export const useConfig = defineStore('config', () => {
  const config = useLocalStorage(symbol.config, defaultConfig)
  config.value = defaultsDeep(config.value, defaultConfig)
  console.log('config setup', config.value)
  const isSystemDark = usePreferredDark()
  const isDark = computed(() => config.value['app.darkMode'] || isSystemDark.value)

  return { ...config.value, isDark }
})

export const deviceInfo = Capacitor.isNativePlatform() ? await Device.getInfo() : undefined