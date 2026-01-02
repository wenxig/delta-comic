import { defineStore } from "pinia"
import { StatusBar } from "tauri-plugin-delta-comic"
import { shallowRef, watch, type Component, type VNode } from "vue"
import { shallowReactive } from "vue"
export const useAppStore = defineStore('app', () => {
  const isFullScreen = shallowRef(false)
  watch(isFullScreen, isFullScreen => {
    if (isFullScreen) {
      StatusBar.hide()
      return
    }
    StatusBar.show()
  }, { immediate: true })

  const renderRootNodes = shallowReactive<(VNode | Component)[]>([])
  return { isFullScreen, renderRootNodes }
})