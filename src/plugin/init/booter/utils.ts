import { Comp, Utils, type PluginConfig, type PluginConfigAuth, type PluginConfigAuthMethod } from "delta-comic-core"
import { isEmpty, sortBy } from "es-toolkit/compat"
import { delay } from "motion-v"
import { Mutex } from "es-toolkit"
import { createForm } from "@/utils/createForm"
import { h, markRaw, ref } from "vue"
import { defineComponent } from "vue"
import { useAppStore } from "@/stores/app"

export const testApi = async (cfg: NonNullable<PluginConfig['api']>[string]) => {
  const forks = await cfg.forks()
  return await test(forks, cfg.test)
}

export const testResourceApi = (cfg: NonNullable<NonNullable<PluginConfig['resource']>['types']>[number]) => {
  const forks = cfg.urls
  return test(forks, cfg.test)
}

const test = async (forks: string[], test: (url: string, signal: AbortSignal) => PromiseLike<any>) => {
  if (isEmpty(forks)) throw new Error('[plugin test] no fork found')
  const record: [url: string, result: false | number][] = []
  const abortController = new AbortController()
  await Promise.all(forks.map(async fork => {
    try {
      const begin = Date.now()
      const stopTimeout = delay(() => {
        abortController.abort()
      }, 10000)
      await test(fork, abortController.signal)
      stopTimeout()
      const end = Date.now()
      const time = end - begin
      record.push([fork, time])
      console.log(`[plugin test] resource url ${fork} connected time ${time}ms`)
      abortController.abort()
    } catch (error) {
      record.push([fork, false])
      console.log(`[plugin test] resource url ${fork} can not connected`)
    }
  }))
  const result = sortBy(record.filter(v => v[1] != false), v => v[1])[0]
  console.log(`[plugin test] resource test done`, result)
  if (!result) {
    return ['', false] as [string, false]
  }
  return result
}

const authPopupMutex = new Mutex
export const auth = async (cfg: PluginConfigAuth, pluginName: string, step: {
  name: string
  description: string
}) => {
}