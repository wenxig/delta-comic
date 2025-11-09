import { defineStore } from "pinia"
import { shallowRef, watch, type Component, type VNode } from "vue"
import { StatusBar } from '@capacitor/status-bar'
import { Capacitor } from "@capacitor/core"
import { shallowReactive } from "vue"
export const useAppStore = defineStore('app', () => {
  const isFullScreen = shallowRef(false)
  if (Capacitor.isNativePlatform()) watch(isFullScreen, isFullScreen => {
    if (isFullScreen) {
      StatusBar.hide()
      return
    }
    StatusBar.show()
  }, { immediate: true })

  const renderRootNodes = shallowReactive<(VNode | Component)[]>([])
  return { isFullScreen, renderRootNodes }
})