import { useLocalStorage } from "@vueuse/core"
import type { PluginInstance } from "delta-comic-core"
import { defineStore } from "pinia"
import { shallowReactive } from "vue"

export const usePluginStore = defineStore('plugin', helper => {
  const plugins = shallowReactive(new Map<string, PluginInstance<any>>())
  const $addPlugin = helper.action(<T>(cfg: PluginInstance<T>) => {
    plugins.set(cfg.name, cfg)
  }, 'addPlugin')

  const savedPluginPath = useLocalStorage('app.savedPluginPath', new Array<string>())
  const $installPlugin = async (url: string) => {

  }
  return { $addPlugin }
})