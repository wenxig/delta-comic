import type { PluginInstance } from "delta-comic-core"
import { defineStore } from "pinia"

export const usePluginStore = defineStore('plugin', helper => {
  const $addPlugin = helper.action(<T>(cfg: PluginInstance<T>) => {

  }, 'addPlugin')

  return { $addPlugin }
})