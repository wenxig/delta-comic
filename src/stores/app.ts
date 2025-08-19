import { defineStore } from "pinia"
import { shallowRef, watch } from "vue"
import { StatusBar } from '@capacitor/status-bar'
export const useAppStore = defineStore('app', () => {
  const isFullScreen = shallowRef(false)
  watch(isFullScreen, isFullScreen => {
    if (isFullScreen) {
      StatusBar.hide()
      return
    }
    StatusBar.show()
  }, { immediate: true })
  return { isFullScreen }
})