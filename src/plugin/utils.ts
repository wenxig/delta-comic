import axios from "axios"
import { Comp, Utils, type PluginConfig, type PluginConfigAuth, type PluginConfigAuthMethod } from "delta-comic-core"
import { isEmpty, sortBy } from "es-toolkit/compat"
import { delay } from "motion-v"
import { Mutex } from "es-toolkit"
import { createForm } from "@/utils/createForm"
import { h, markRaw, ref } from "vue"
import { defineComponent } from "vue"
import { useAppStore } from "@/stores/app"

export const testApi = async (cfg: NonNullable<PluginConfig['api']>[string]): Promise<[url: string, time: number | false]> => {
  const forks = await cfg.forks()
  if (isEmpty(forks)) throw new Error('[plugin test] no fork found')
  const record: [url: string, result: false | number][] = []
  const abortController = new AbortController()
  await Promise.all(forks.map(async fork => {
    try {
      const begin = Date.now()
      const stopTimeout = delay(() => {
        abortController.abort()
      }, 10000)
      await cfg.test(fork, abortController.signal)
      stopTimeout()
      const end = Date.now()
      const time = end - begin
      record.push([fork, time])
      console.log(`[plugin test] api url ${fork} connected time ${time}ms`)
      abortController.abort()
    } catch (error) {
      record.push([fork, false])
      console.log(`[plugin test] api url ${fork} can not connected`)
    }
  }))
  const result = sortBy(record.filter(v => v[1] != false), v => v[1])[0]
  console.log(`[plugin test] api test done`, result)
  if (!result) {
    return ['', false]
  }
  return result
}

export const testImageApi = async (cfg: NonNullable<PluginConfig['image']>): Promise<Record<string, [url: string, time: number | false]>> => {
  const api: Record<string, [url: string, time: number | false]> = {}
  const namespaces = Object.keys(cfg.forks)
  console.log(`[plugin test] image url`, cfg)
  const results = await Promise.all(
    namespaces.map<Promise<[url: string, result: number | false]>>(async namespace => {
      const forks = cfg.forks[namespace]
      if (isEmpty(forks)) throw new Error('[plugin testImageApi] not found any forks')
      const record: [url: string, result: false | number][] = []
      const abortController = new AbortController()
      await Promise.all(forks.map(async fork => {
        try {
          const begin = Date.now()
          const stopTimeout = delay(() => {
            abortController.abort()
          }, 10000)
          await axios.get(`${fork}/${cfg.test}?random=${Math.random()}`, {
            signal: abortController.signal
          })
          stopTimeout()
          const end = Date.now()
          const time = end - begin
          record.push([fork, time])
          console.log(`[plugin test] image url ${fork} connected time ${time}ms`)
          abortController.abort()
        } catch (error) {
          record.push([fork, false])
          console.log(`[plugin test] image url ${fork} can not connected`)
        }
      }))
      const result = sortBy(record.filter(v => v[1] != false), v => v[1])[0]
      console.log(`[plugin test] image test done`, result)
      if (!result) {
        return ['', false]
      }
      return result
    })
  )
  namespaces.forEach((namespace, i) => {
    api[namespace] = results[i]
  })
  return api
}

const authPopupMutex = new Mutex
export const auth = async (cfg: PluginConfigAuth, pluginName: string, step: {
  name: string
  description: string
}) => {
  step.description = '判定鉴权状态中...'
  const isPass = await cfg.passSelect()
  const waitMethod = Promise.withResolvers<'logIn' | 'signUp'>()
  console.log(`[plugin auth] ${pluginName}, isPass: ${isPass}`)
  await authPopupMutex.acquire()
  step.description = '等待其他插件鉴权结束...'
  if (!isPass) {
    step.description = '选择鉴权方式'
    try {
      await Utils.message.createDialog({
        type: 'default',
        positiveText: '登录',
        negativeText: '注册',
        closable: false,
        maskClosable: false,
        content: '选择鉴权方式',
        title: pluginName
      })
      waitMethod.resolve('logIn')
    } catch {
      waitMethod.resolve('signUp')
    }
  } else {
    step.description = '跳过鉴权方式选择'
    waitMethod.resolve(isPass)
  }
  const method = await waitMethod.promise
  step.description = '鉴权中...'
  const by: PluginConfigAuthMethod = {
    async form(form) {
      const f = createForm(form)
      const store = useAppStore()
      store.renderRootNodes.push(markRaw(defineComponent(() => {
        const show = ref(true)
        f.data.then(() => show.value = false)
        return () => h(Comp.Popup, {
          show: show.value,
          position: 'center',
          round: true,
          class: 'p-6 pt-3 !w-[95vw]',
          transitionAppear: true
        }, [
          h('div', { class: 'pl-1 py-1 text-lg w-full' }, [pluginName]),
          f.comp
        ])
      })))
      const data = await f.data
      return data
    },
    website(_url) {
      return window
    },
  }
  if (method == 'logIn') {
    await cfg.logIn(by)
  } else if (method == 'signUp') {
    await cfg.signUp(by)
  }
  authPopupMutex.release()
  step.description = '鉴权成功'
}