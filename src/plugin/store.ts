import { Utils, type PluginInstance } from "delta-comic-core"
import localforage from "localforage"
import { isEmpty, sortBy } from "lodash-es"
import { delay } from "motion-v"
import { defineStore } from "pinia"
import { parse, Meta } from 'userscript-meta'
import { shallowReactive, shallowReadonly, watch } from "vue"
const db = localforage.createInstance({
  name: 'localforage/pluginCode'
})
await db.ready()
const _savedPluginCode = await db.getItem<[string, { content: string }][]>('codes')


const testApi = async (cfg: NonNullable<PluginInstance['api']>[string]) => {
  const forks = await Promise.try(cfg.forks)
  if (isEmpty(forks)) return undefined
  const record: [url: string, result: false | number][] = []
  for (const fork of forks) {
    try {
      const abortController = new Utils.request.SmartAbortController()
      const begin = Date.now()
      const test = cfg.test(fork, abortController.signal)
      delay(() => {
        abortController.abort()
      }, 10000)
      test.then(() => {
        const end = Date.now()
        const time = end - begin
        record.push([fork, time])
      })
    } catch (error) {
      record.push([fork, false])
    }
  }
  const result = sortBy(record.filter(v => v[1] != false), v => v[1])[0]
  if (!result) return false
  return result[0]
}


export const usePluginStore = defineStore('plugin', helper => {
  const plugins = shallowReactive(new Map<string, PluginInstance>())
  const $loadPlugin = helper.action(async (cfg: PluginInstance) => {
    console.log(cfg)
    plugins.set(cfg.name, cfg)
    const api: Record<string, string | false | undefined> = {}
    if (cfg.api) {
      const namespaces = Object.keys(cfg.api)
      const results = await Promise.all(
        namespaces.map(namespace => testApi(cfg.api![namespace]))
      )
      namespaces.forEach((namespace, i) => {
        api[namespace] = results[i]
      })
    }
    return {
      api
    }
  }, 'loadPlugin')

  const savedPluginCode = shallowReactive(new Map(_savedPluginCode))
  watch(savedPluginCode, savedPluginCode => db.setItem('codes', [...savedPluginCode.entries()]))

  const $addPlugin = helper.action((fullCode: string) => {
    const metadata = parse(fullCode)
    savedPluginCode.set(metadata.name.toString(), {
      content: fullCode
    })
  }, 'addPlugin')
  return { $loadPlugin, plugins, savedPluginCode, $addPlugin }
})