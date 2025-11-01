import { Utils } from "delta-comic-core"
import { scriptDB, usePluginStore, type SavedPluginCode } from "./store"
import { $initCore } from "./core"
import { cloneDeep, remove } from "es-toolkit"
import { isEmpty } from "es-toolkit/compat"
import { reactive } from "vue"
import { until } from "@vueuse/core"
const { SharedFunction } = Utils.eventBus
const loadings = reactive<Record<string, boolean>>({})
SharedFunction.define(async cfg => {
  const store = usePluginStore(window.$api.piniaInstance)
  console.log('[plugin addPlugin] new plugin defined', cfg)
  await store.$loadPlugin(cfg)
  loadings[cfg.name] = true
}, 'core', 'addPlugin')

export const bootPlugin = Utils.data.PromiseContent.fromAsyncFunction(async () => {
  const store = usePluginStore(window.$api.piniaInstance)
  await $initCore()

  /* 查找循环引用原理
    正常的插件一定可以被格式化为一个多入口树，
    因此无法被放入树的插件一定存在循环引用
  */
  const foundDeps = new Set<string>(['core'])
  const plugins = cloneDeep(store.savedPluginCode.filter(v => v.enable))
  const allLevels = new Array<SavedPluginCode[]>()
  while (true) {
    const level = plugins.filter(p => p.depends.every(d => foundDeps.has(d)))
    allLevels.push(level)
    remove(plugins, p => level.includes(p))
    for (const { name } of level) foundDeps.add(name)
    if (isEmpty(level)) break
  }
  if (!isEmpty(plugins))
    throw new Error(`插件循环引用: ${plugins.map(v => v.name).join(', ')}`)

  for (const level of allLevels)
    await Promise.all(level.map(p => bootOne(p)))

  console.log('[plugin bootPlugin] all load done')
})

const bootOne = async (plugin: SavedPluginCode) => {
  const script = document.createElement('script')
  const code = await scriptDB.codes.get(plugin.contentKey)
  if (!code) throw new Error(`[boot one] not found code of ${plugin.name}`)
  const url = URL.createObjectURL(code?.blob)
  script.src = url
  document.body.appendChild(script)
  await until(() => loadings[plugin.name]).toBeTruthy()
  console.log(`[plugin bootPlugin] booting name "${plugin.name}"`)
}