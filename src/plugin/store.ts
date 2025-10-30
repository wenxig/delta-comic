import { uni, type PluginConfig, type PluginConfigSearchMethod, _pluginExposes, Utils } from "delta-comic-core"
import { defineStore } from "pinia"
import { parse } from 'userscript-meta'
import { computed, reactive, type Raw, type VNode } from "vue"
import { shallowReactive } from "vue"
import axios from "axios"
import { auth, testApi, testImageApi } from "./utils"
import Dexie from "dexie"
import type { Table } from "dexie"
import { useLiveQueryRef } from "@/utils/db"
import { isString } from "es-toolkit"

export interface SavedPluginCode {
  content: Blob
  name: string
  displayName: string
  depends: string[]
  version: string
  author: string
  description: string
  enable: boolean

  updateUrl?: string
}

export const scriptDB = new class ScriptDB extends Dexie {
  public scripts!: Table<SavedPluginCode, SavedPluginCode['name']>
  constructor() {
    super('ScriptDB')
    this.version(1).stores({
      scripts: 'name'
    })
  }
}


export type PluginLoadingMicroSteps = {
  steps: {
    name: string
    description: string
  }[]
  now: {
    stepsIndex: number
    status: 'process' | 'error' | 'finish' | 'wait'
  }
}

export type PluginLoadingRecorder = {
  mountEls: Raw<VNode>[]
}

export const usePluginStore = defineStore('plugin', helper => {
  const plugins = shallowReactive(new Map<string, PluginConfig>())
  const pluginSteps = reactive<Record<string, PluginLoadingMicroSteps>>({})
  const pluginLoadingRecorder = reactive<PluginLoadingRecorder>({
    mountEls: []
  })
  const $loadPlugin = helper.action(async (cfg: PluginConfig, onBootedDone?: Function) => {
    plugins.set(cfg.name, cfg)
    pluginSteps[cfg.name] = {
      now: {
        status: 'wait',
        stepsIndex: 0
      },
      steps: []
    }
    if (cfg.api)
      pluginSteps[cfg.name].steps.push({
        name: '接口测试',
        description: '' // 获取全部接口
      })
    if (cfg.image)
      pluginSteps[cfg.name].steps.push({
        name: '图像链接测试',
        description: '' // 获取全部接口
      })
    if (cfg.auth)
      pluginSteps[cfg.name].steps.push({
        name: '登录',
        description: ''
      })
    if (cfg.otherProgress)
      pluginSteps[cfg.name].steps.push(...cfg.otherProgress.map(v => ({
        name: v.name,
        description: ''
      })))
    const api: Record<string, string | false | undefined> = {}
    try {
      if (cfg.api) {
        const msIndex = pluginSteps[cfg.name].steps.findIndex(v => v.name === '接口测试')!
        const namespaces = Object.keys(cfg.api)
        pluginSteps[cfg.name].now.stepsIndex = msIndex + 1
        pluginSteps[cfg.name].now.status = 'process'
        pluginSteps[cfg.name].steps[msIndex].description = '开始并发测试'
        const results = await Promise.all(
          namespaces.map(namespace => testApi(cfg.api![namespace]))
        )
        const displayResult = new Array<[namespace: string, time: number | false]>()
        namespaces.forEach((namespace, i) => {
          api[namespace] = results[i][0]
          displayResult.push([namespace, results[i][1]])
        })
        if (Object.values(api).some(v => v == false)) {
          pluginSteps[cfg.name].steps[msIndex].description = `测试完成, 无法连接至服务器`
          throw new Error('[plugin test] can not connect to server')
        }
        pluginSteps[cfg.name].steps[msIndex].description = `测试完成, ${displayResult.map(ent => `${ent[0]}->${ent[1]}ms`).join(', ')}`
      }
      if (cfg.image) {
        const msIndex = pluginSteps[cfg.name].steps.findIndex(v => v.name === '图像链接测试')!
        pluginSteps[cfg.name].now.stepsIndex = msIndex + 1
        pluginSteps[cfg.name].now.status = 'process'
        const imageApi = await testImageApi(cfg.image, pluginSteps[cfg.name], msIndex)
        if (Object.values(api).some(v => v == false)) {
          pluginSteps[cfg.name].steps[msIndex].description = `测试完成, 无法连接至图源`
          throw new Error('[plugin testImageApi] can not connect to server')
        }
        pluginSteps[cfg.name].steps[msIndex].description = `测试完成, `
        for (const namespace in imageApi) {
          if (!Object.hasOwn(imageApi, namespace)) continue
          const res = imageApi[namespace]
          pluginSteps[cfg.name].steps[msIndex].description += `${namespace}->${res[1]}ms`
          if (res) uni.image.Image.activeFork.set(`${cfg.name}:${namespace}`, res[0])
        }
      }
      const expose = await cfg.onBooted?.({
        api
      })
      if (expose) _pluginExposes.set(Symbol.for(`expose:${cfg.name}`), expose)
      onBootedDone?.()
      if (cfg.auth) {
        const msIndex = pluginSteps[cfg.name].steps.findIndex(v => v.name === '登录')!
        pluginSteps[cfg.name].now.stepsIndex = msIndex + 1
        await auth(cfg.auth, $getPluginDisplayName(cfg.name), pluginSteps[cfg.name], msIndex)
      }
      if (cfg.otherProgress) {
        for (const process of cfg.otherProgress) {
          const msIndex = pluginSteps[cfg.name].steps.findLastIndex(v => v.name === process.name)!
          pluginSteps[cfg.name].now.stepsIndex = msIndex + 1
          await process.call(description => {
            pluginSteps[cfg.name].steps[msIndex].description = description
          })
        }
      }
    } catch (error) {
      pluginSteps[cfg.name].now.status = 'error'
      throw error
    }
    console.log(`[plugin usePluginStore.$loadPlugin] plugin "${cfg.name}" load done`)
  }, 'loadPlugin')

  const $addPlugin = helper.action((fullCode: string, updateUrl?: string) => {
    const metadata = parse(fullCode)
    const name = metadata['name:default'].toString()
    const code = `
    (function(){
      var _console = window.console;
      var console = {
        log(...args) {
          _console.log("[plugin->${name}]",...args)
        },
        info(...args) {
          _console.info("[plugin->${name}]",...args)
        },
        debug(...args) {
          _console.debug("[plugin->${name}]",...args)
        },
        warn(...args) {
          _console.warn("[plugin->${name}]",...args)
        },
        error(...args) {
          _console.error("[plugin->${name}]",...args)
        }
      };
      // --inject code done--
      ${fullCode}
    })();
    `
    return scriptDB.scripts.put({
      content: new Blob([code], { type: 'text/plain' }),
      depends: isString(metadata.require) ? [metadata.require] : metadata.require,
      author: metadata.author.toString(),
      description: metadata.description.toString(),
      name,
      version: metadata.version.toString(),
      enable: true,
      updateUrl,
      displayName: metadata['name:ds'].toString()
    })
  }, 'addPlugin')

  const $changePluginEnable = helper.action(async (name: string) => {
    const config = await scriptDB.scripts.get(name)
    if (!config) throw new Error(`not found plugin named "${name}"`)
    await scriptDB.scripts.put({
      ...config,
      enable: !config.enable
    })
  }, 'changePluginEnable')

  const $removePlugin = helper.action((name: string) =>
    scriptDB.scripts.delete(name)
    , 'removePlugin')

  const $addPluginFromNet = helper.action(async (url: string) => {
    const content = (await axios.get<string>(url)).data
    return $addPlugin(content, url)
  }, 'addPluginFromNet')

  const allSearchSource = computed(() => Array.from(plugins.values()).filter(v => v.search?.methods).map(v => [v.name, Object.entries(v.search?.methods ?? {})] as [plugin: string, sources: [name: string, method: PluginConfigSearchMethod][]]))

  const savedPluginCode = useLiveQueryRef(() => scriptDB.scripts.toArray(), [])

  const $getPluginDisplayName = helper.action((name: string) => {
    console.log('[$getPluginDisplayName]', savedPluginCode.value, name)
    return savedPluginCode.value.find(v => v.name == name)?.displayName ?? name
  }, 'getPluginDisplayName')

  return { $loadPlugin, $removePlugin, $getPluginDisplayName, plugins, savedPluginCode, pluginLoadingRecorder, $changePluginEnable, $addPlugin, $addPluginFromNet, allSearchSource, pluginSteps }
})
