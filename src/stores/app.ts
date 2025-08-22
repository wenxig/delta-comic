import { defineStore } from "pinia"
import { shallowRef, watch } from "vue"
import { StatusBar } from '@capacitor/status-bar'
import { Capacitor } from "@capacitor/core"
export const useAppStore = defineStore('app', () => {
  const isFullScreen = shallowRef(false)
  if (Capacitor.isNativePlatform()) watch(isFullScreen, isFullScreen => {
    if (isFullScreen) {
      StatusBar.hide()
      return
    }
    StatusBar.show()
  }, { immediate: true })
  return { isFullScreen }
})