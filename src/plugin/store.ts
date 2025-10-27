import { Comp, uni, Utils, type PluginConfigAuth, type PluginConfigAuthMethod, type PluginConfig, type PluginConfigSearchMethod } from "delta-comic-core"
import localforage from "localforage"
import { isEmpty, sortBy } from "es-toolkit/compat"
import { delay } from "motion-v"
import { defineStore } from "pinia"
import { parse } from 'userscript-meta'
import { computed, defineComponent, h, markRaw, reactive, ref, type Raw, type VNode } from "vue"
import { shallowReactive, watch } from "vue"
import { createForm } from "@/utils/createForm"
import axios from "axios"
const _savedPluginCode = await localforage.getItem<[string, { content: string }][]>('codes')


const testApi = async (cfg: NonNullable<PluginConfig['api']>[string]): Promise<[url: string, time: number | false]> => {
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

const testImageApi = async (cfg: NonNullable<PluginConfig['image']>, ms: PluginLoadingMicroSteps, msIndex: number): Promise<Record<string, [url: string, time: number | false]>> => {
  const api: Record<string, [url: string, time: number | false]> = {}
  const namespaces = Object.keys(cfg.forks)
  ms.steps[msIndex].description = '开始并发测试'
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
  name: string,
  done: boolean,
  mountEls: Raw<VNode>[]
}

export const usePluginStore = defineStore('plugin', helper => {
  const plugins = shallowReactive(new Map<string, PluginConfig>())
  const pluginSteps = reactive<Record<string, PluginLoadingMicroSteps>>({})
  const pluginLoadingRecorder = reactive<PluginLoadingRecorder>({
    name: '',
    done: false,
    mountEls: []
  })
  const $loadPlugin = helper.action(async (cfg: PluginConfig) => {
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
      await cfg.onBooted?.({
        api
      })
      if (cfg.auth) {
        const msIndex = pluginSteps[cfg.name].steps.findIndex(v => v.name === '登录')!
        pluginSteps[cfg.name].now.stepsIndex = msIndex + 1
        await auth(cfg.auth, pluginSteps[cfg.name], msIndex)
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

  const savedPluginCode = shallowReactive(new Map(_savedPluginCode))
  watch(savedPluginCode, savedPluginCode => localforage.setItem('codes', [...savedPluginCode.entries()]))

  const $addPlugin = helper.action((fullCode: string) => {
    const metadata = parse(fullCode)
    savedPluginCode.set(metadata.name.toString(), {
      content: fullCode
    })
  }, 'addPlugin')

  const $addPluginDev = helper.action((url: string) => {
    savedPluginCode.set(new URL(url).host, {
      content: url
    })
  }, 'addPluginDev')

  const allSearchSource = computed(() => Array.from(plugins.values()).filter(v => v.search?.methods).map(v => [v.name, Object.entries(v.search?.methods ?? {})] as [plugin: string, sources: [name: string, method: PluginConfigSearchMethod][]]))


  return { $loadPlugin, plugins, savedPluginCode, pluginLoadingRecorder, $addPlugin, $addPluginDev, allSearchSource, pluginSteps }
})

const auth = async (cfg: PluginConfigAuth, rec: PluginLoadingMicroSteps, msIndex: number) => {
  rec.steps[msIndex].description = '判定登录状态中...'
  const isPass = await cfg.passSelect()
  const waitMethod = Promise.withResolvers<'logIn' | 'signUp'>()
  console.log(`[plugin auth]isPass: ${isPass}`)
  if (!isPass) {
    rec.steps[msIndex].description = '选择登录方式'
    try {
      await Utils.message.createDialog({
        type: 'default',
        positiveText: '登录',
        negativeText: '注册',
        closable: false,
        maskClosable: false,
        content: '选择鉴权方式',
        title: '登录'
      })
      waitMethod.resolve('logIn')
    } catch {
      waitMethod.resolve('signUp')
    }
  } else {
    rec.steps[msIndex].description = '跳过登录方式选择'
    waitMethod.resolve(isPass)
  }
  const method = await waitMethod.promise
  rec.steps[msIndex].description = '登录中...'
  const by: PluginConfigAuthMethod = {
    form(form) {
      const f = createForm(form)
      const store = usePluginStore()
      store.pluginLoadingRecorder.mountEls.push(markRaw(defineComponent(() => {
        const show = ref(true)
        f.data.then(() => show.value = false)
        return () => <any>h(<any>Comp.Popup, <any>{
          show: show.value,
          position: 'center',
          round: true,
          class: 'p-3 !w-[95vw]'
        }, <any>[f.comp])
      }) as any))
      return f.data
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
  rec.steps[msIndex].description = '登录成功'
}