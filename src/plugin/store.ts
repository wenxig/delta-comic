import { type PluginConfig, type PluginConfigSearchMethod, _pluginExposes } from "delta-comic-core"
import { defineStore } from "pinia"
import { computed, reactive } from "vue"
import { shallowReactive } from "vue"
import { PluginArchiveMetaDB } from "./db"
export interface SavePluginBlob {
  key: string
  blob: Blob
}

export interface PluginData {
  key: string
  value: any
}


export type PluginLoadingMicroSteps = {
  steps: {
    name: string
    description: string
  }[]
  now: {
    stepsIndex: number
    status: 'process' | 'error' | 'finish' | 'wait'
    error?: Error
  }
}

export const usePluginStore = defineStore('plugin', helper => {
  const plugins = shallowReactive(new Map<string, PluginConfig>())
  const pluginSteps = reactive<Record<string, PluginLoadingMicroSteps>>({})

  const allSearchSource = computed(() => Array.from(plugins.values()).filter(v => v.search?.methods).map(v => [v.name, Object.entries(v.search?.methods ?? {})] as [plugin: string, sources: [name: string, method: PluginConfigSearchMethod][]]))

  const pluginDisplayNameCache = new Map<string, string>()
  const $getPluginDisplayName = helper.action(async (key: string) => {
    if (pluginDisplayNameCache.has(key)) return pluginDisplayNameCache.get(key)!
    const displayName = (await PluginArchiveMetaDB.get(key))?.meta.name.display ?? key
    pluginDisplayNameCache.set(key, displayName)
    return displayName
  }, 'getPluginDisplayName')

  return { $getPluginDisplayName, plugins, allSearchSource, pluginSteps }
})
