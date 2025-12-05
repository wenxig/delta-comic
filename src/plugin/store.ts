import { uni, type PluginConfig, type PluginConfigSearchMethod, _pluginExposes, type Utils } from "delta-comic-core"
import { defineStore } from "pinia"
import { parse } from 'userscript-meta'
import { computed, reactive } from "vue"
import { shallowReactive } from "vue"
import axios from "axios"
import { auth, testApi, testImageApi } from "./utils"
import Dexie from "dexie"
import type { Table } from "dexie"
import { useLiveQueryRef } from "@/utils/db"
import { isString } from "es-toolkit"
import { Octokit } from "@octokit/rest"

export interface SavedPluginCode {
  contentKey: string // SavePluginBlob.key
  name: string
  displayName: string
  depends: string[]
  version: string
  author: string
  description: string
  enable: boolean
  updateUrl?: string
}

export interface SavePluginBlob {
  key: string
  blob: Blob
}

export interface PluginData {
  key: string
  value: any
}

export const scriptDB = new class ScriptDB extends Dexie {
  public scripts!: Table<SavedPluginCode, SavedPluginCode['name'], SavedPluginCode, { content: SavePluginBlob }>
  public codes!: Table<SavePluginBlob, SavePluginBlob['key']>
  constructor() {
    super('ScriptDB')
    this.version(1).stores({
      scripts: 'name, contentKey',
      codes: 'key'
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
    error?: Error
  }
}

export const usePluginStore = defineStore('plugin', helper => {
  const octokit = new Octokit()
  const plugins = shallowReactive(new Map<string, PluginConfig>())
  const pluginSteps = reactive<Record<string, PluginLoadingMicroSteps>>({})
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
        pluginSteps[cfg.name].now.stepsIndex = msIndex 
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
        pluginSteps[cfg.name].now.stepsIndex = msIndex 
        pluginSteps[cfg.name].now.status = 'process'
        pluginSteps[cfg.name].steps[msIndex].description = '开始并发测试'
        const imageApi = await testImageApi(cfg.image)
        if (Object.values(api).some(v => v == false)) {
          pluginSteps[cfg.name].steps[msIndex].description = `测试完成, 无法连接至图源`
          throw new Error('[plugin testImageApi] can not connect to server')
        }
        pluginSteps[cfg.name].steps[msIndex].description = `测试完成, `
        for (const namespace in imageApi) {
          if (!Object.hasOwn(imageApi, namespace)) continue
          const res = imageApi[namespace]
          pluginSteps[cfg.name].steps[msIndex].description += `${namespace}->${res[1]}ms`
          if (res) uni.image.Image.activeFork.set([cfg.name, namespace], res[0])
        }
      }
      const expose = await cfg.onBooted?.({
        api
      })
      if (expose) _pluginExposes.set(Symbol.for(`expose:${cfg.name}`), expose)
      onBootedDone?.()
      try {
        if (cfg.auth) {
          const msIndex = pluginSteps[cfg.name].steps.findIndex(v => v.name === '登录')!
          pluginSteps[cfg.name].now.stepsIndex = msIndex 
          await auth(cfg.auth, $getPluginDisplayName(cfg.name), pluginSteps[cfg.name].steps[msIndex])
        }
      } catch (error) {
        pluginSteps[cfg.name].steps.find(v => v.name === '登录')!.description = '登录失败'
        throw error
      }
      if (cfg.otherProgress) {
        for (const process of cfg.otherProgress) {
          const msIndex = pluginSteps[cfg.name].steps.findLastIndex(v => v.name === process.name)!
          pluginSteps[cfg.name].now.stepsIndex = msIndex 
          await process.call(description => {
            pluginSteps[cfg.name].steps[msIndex].description = description
          })
        }
      }
    } catch (error) {
      pluginSteps[cfg.name].now.status = 'error'
      pluginSteps[cfg.name].now.error = error as Error
      throw error
    }
    console.log(`[plugin usePluginStore.$loadPlugin] plugin "${cfg.name}" load done`)
  }, 'loadPlugin')

  const $addPlugin = helper.action((fullCode: string, method: Utils.message.DownloadMessageBind, updateUrl?: string) =>
    method.createLoading('数据库写入中', async c => {
      c.retryable = true
      c.description = '修正代码中'
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
      ${updateUrl
          ? fullCode
            .replaceAll('127.0.0.1', new URL(updateUrl).hostname)
            .replaceAll('localhost', new URL(updateUrl).hostname)
          : fullCode
        }
    })();
    `
      const blob = new Blob([code], { type: 'text/plain' })
      c.description = '写入中'
      await scriptDB.transaction('rw', [scriptDB.scripts, scriptDB.codes], trans => {
        trans.scripts.put({
          contentKey: name,
          depends: isString(metadata.require) ? [metadata.require] : metadata.require,
          author: metadata.author.toString(),
          description: metadata.description.toString(),
          name,
          version: metadata.version.toString(),
          enable: true,
          updateUrl,
          displayName: metadata['name:ds'].toString()
        })
        trans.codes.put({
          blob,
          key: name
        })
      })
    }), 'addPlugin')

  const $changePluginEnable = helper.action(async (name: string) => {
    const config = await scriptDB.scripts.get(name)
    if (!config) throw new Error(`not found plugin named "${name}"`)
    await scriptDB.scripts.put({
      ...config,
      enable: !config.enable
    })
  }, 'changePluginEnable')

  const $removePlugin = helper.action((name: string) => scriptDB.transaction('rw', [scriptDB.scripts, scriptDB.codes], () => {
    scriptDB.scripts.delete(name)
    scriptDB.codes.delete(name)
  }), 'removePlugin')

  const $addPluginFromNet = helper.action(async (url: string, method: Utils.message.DownloadMessageBind) => {
    const content = await download(url, method)
    return $addPlugin(content, method, url)
  }, 'addPluginFromNet')

  const download = (url: string, method: Utils.message.DownloadMessageBind) =>
    method.createProgress('下载插件中', async c => {
      c.retryable = true
      c.description = '下载中'
      const res = await axios.request<string>({
        url,
        responseType: 'text',
        onDownloadProgress: progressEvent => {
          if (progressEvent.lengthComputable) {
            c.progress = progressEvent.loaded / progressEvent.total! * 100 //实时获取最新下载进度
          }
        }
      })
      return res.data
    })


  const $addPluginFromGithub = helper.action(async (owner: string, repo: string, method: Utils.message.DownloadMessageBind) => {
    const url = await method.createLoading('获取仓库信息', async c => {
      c.retryable = true
      c.description = '请求中'
      const { data: release } = await octokit.rest.repos.getLatestRelease({ owner, repo })
      const assets = release.assets.find(v => v.name.endsWith('js')) ?? release.assets[0]
      if (!assets) throw new Error('未找到资源')
      return assets.browser_download_url
    })

    const content = await download(url, method)

    return $addPlugin(content, method, `https://github.com/${owner}/${repo}/release`)
  }, 'addPluginFromGithub')

  const allSearchSource = computed(() => Array.from(plugins.values()).filter(v => v.search?.methods).map(v => [v.name, Object.entries(v.search?.methods ?? {})] as [plugin: string, sources: [name: string, method: PluginConfigSearchMethod][]]))

  const savedPluginCode = useLiveQueryRef(() => scriptDB.scripts.toArray(), [])

  const pluginDisplayNameCache = new Map<string, string>()
  const $getPluginDisplayName = helper.action((name: string) => {
    if (pluginDisplayNameCache.has(name)) return pluginDisplayNameCache.get(name)!
    const displayName = savedPluginCode.value.find(v => v.name == name)?.displayName ?? name
    pluginDisplayNameCache.set(name, displayName)
    console.log('[$getPluginDisplayName]', savedPluginCode.value, name, '->', displayName)
    return displayName
  }, 'getPluginDisplayName')


  const $updatePlugin = helper.action(async (name: string, method: Utils.message.DownloadMessageBind) => {
    const { isGithub, url } = await method.createLoading('检测插件类型', async c => {
      c.retryable = true
      c.description = '检测中'
      const plugin = await scriptDB.scripts.get(name)
      if (!plugin) throw new Error(`Can not found plugin named "${name}".`)
      if (!plugin.updateUrl) throw new Error(`Can not update plugin named "${name}" because haven't update url.`)
      const url = new URL(plugin.updateUrl)
      const isGithub = url.hostname.includes('github.com')
      if (isGithub) c.description = 'Github'
      else c.description = '其他源'
      return { url, isGithub }
    })
    if (!isGithub) {
      const content = await download(url.toString(), method)
      return await $addPlugin(content, method, url.toString())
    }
    const [owner, repo] = url.pathname.split('/').filter(Boolean)
    await $addPluginFromGithub(owner, repo, method)
  }, 'updatePlugin')

  return { $loadPlugin, $updatePlugin, $removePlugin, $getPluginDisplayName, plugins, savedPluginCode, $changePluginEnable, $addPlugin, $addPluginFromNet, $addPluginFromGithub, allSearchSource, pluginSteps }
})
