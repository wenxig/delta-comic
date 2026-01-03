import { _pluginExposes, uni, Utils, type PluginConfig, type PluginMeta } from "delta-comic-core"
import { usePluginStore } from "./store"
import { $initCore } from "./core"
import { cloneDeep, remove } from "es-toolkit"
import { isEmpty } from "es-toolkit/compat"
import { reactive } from "vue"
import { until } from "@vueuse/core"
import { bootPlugin, type PluginArchiveMeta } from "./init"
const loadings = reactive<Record<string, boolean>>({})
const { SharedFunction } = Utils.eventBus
SharedFunction.define(async cfg => {
  console.log('[plugin addPlugin] new plugin defined', cfg)
  await bootPlugin(cfg)
  loadings[cfg.name] = true
}, 'core', 'addPlugin')

export const loadAllPlugins = Utils.data.PromiseContent.fromAsyncFunction(async () => {
  const store = usePluginStore()
  await $initCore()

  /* 查找循环引用原理
    正常的插件一定可以被格式化为一个多入口树，
    因此无法被放入树的插件一定存在循环引用
  */
  const foundDeps = new Set<string>(['core'])
  const plugins = cloneDeep((<PluginArchiveMeta[]>(<any>store).savedPluginCode).filter(v => v.enable))
  const allLevels = new Array<PluginArchiveMeta[]>()
  while (true) {
    const level = plugins.filter(p => p.require.every(d => foundDeps.has(d.id)))
    allLevels.push(level)
    remove(plugins, p => level.includes(p))
    for (const { key } of level) foundDeps.add(key)
    if (isEmpty(level)) break
  }
  if (!isEmpty(plugins))
    throw new Error(`插件循环引用: ${plugins.map(v => v.key).join(', ')}`)

  for (const level of allLevels)
    await Promise.all(level.map(p => bootOne(p)))

  console.log('[plugin bootPlugin] all load done')
})

const bootOne = async (plugin: SavedPluginCode) => {
  const store = usePluginStore()
  store.pluginSteps[plugin.key] = {
    now: {
      status: 'wait',
      stepsIndex: 0
    },
    steps: [{
      name: '等待',
      description: '插件载入中'
    }]
  }
  const script = document.createElement('script')
  const code = await scriptDB.codes.get(plugin.key)
  if (!code) throw new Error(`[boot one] not found code of ${plugin.key}`)
  const url = URL.createObjectURL(code?.blob)
  script.src = url
  document.body.appendChild(script)
  await until(() => loadings[plugin.key]).toBeTruthy()
  console.log(`[plugin bootPlugin] booting name "${plugin.key}"`)
}