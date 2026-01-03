import { uni, type PluginConfig, type PluginConfigSearchMethod, _pluginExposes, type Utils, RawPluginMeta, decodePluginMeta, type PluginMeta } from "delta-comic-core"
import { defineStore } from "pinia"
import { parse } from 'userscript-meta'
import { computed, reactive } from "vue"
import { shallowReactive } from "vue"
import axios from "axios"
import { auth, testApi, testResourceApi } from "./utils"
import { useLiveQueryRef } from "@/utils/db"
import { Octokit } from "@octokit/rest"
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
  const $getPluginDisplayName = helper.action((key: string) => {
    if (pluginDisplayNameCache.has(key)) return pluginDisplayNameCache.get(key)!
    const displayName = savedPluginCode.value.find(v => v.key == key)?.name.display ?? key
    pluginDisplayNameCache.set(key, displayName)
    return displayName
  }, 'getPluginDisplayName')

  return { $getPluginDisplayName, plugins, allSearchSource, pluginSteps }
})
