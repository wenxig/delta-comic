import { Utils, type PluginConfig } from "delta-comic-core"
import { sortBy } from "es-toolkit/compat"
import { usePluginStore } from "../store"
import { isString } from "es-toolkit"
import { reactive } from "vue"
import { until } from "@vueuse/core"
import { PluginArchiveMetaDB, type PluginArchiveMeta } from "../db"

export type PluginBooterSetMeta = (meta: Partial<{
  description: string
  name: string
}> | string) => void
export abstract class PluginBooter {
  public abstract name: string
  public abstract call(cfg: PluginConfig, setMeta: PluginBooterSetMeta, env: Record<any, any>): Promise<any>
}

const rawBooters = import.meta.glob<PluginBooter>('./booter/*_*.ts', {
  eager: true,
  import: 'default'
})
const booters = sortBy(Object.entries(rawBooters), ([fname]) => Number(fname.match(/[\d\.]+(?=_)/)?.[0])).map(v => v[1])

export const bootPlugin = async (cfg: PluginConfig) => {
  const { plugins, pluginSteps } = usePluginStore()
  plugins.set(cfg.name, cfg as any)
  try {
    const env: Record<any, any> = {}
    for (const booter of booters) {
      const msIndex = pluginSteps[cfg.name].steps.length
      pluginSteps[cfg.name].steps[msIndex] = {
        name: booter.name,
        description: ''
      }
      pluginSteps[cfg.name].now.stepsIndex = msIndex
      pluginSteps[cfg.name].now.status = 'process'
      await booter.call(cfg, meta => {
        if (isString(meta)) pluginSteps[cfg.name].steps[msIndex].description = meta
        else {
          if (meta.description) pluginSteps[cfg.name].steps[msIndex].description = meta.description
          if (meta.name) pluginSteps[cfg.name].steps[msIndex].name = meta.name
        }
      }, env)
    }
  } catch (error) {
    pluginSteps[cfg.name].now.status = 'error'
    pluginSteps[cfg.name].now.error = error as Error
    throw error
  }
  console.log(`[plugin usePluginStore.$loadPlugin] plugin "${cfg.name}" load done`)
}



export abstract class PluginInstaller {
  public abstract install(input: string): Promise<PluginArchiveMeta>
  public abstract update(pluginMeta: PluginArchiveMeta): Promise<PluginArchiveMeta>
  public abstract isMatched(input: string): boolean
  public abstract name: string
}

const rawInstallers = import.meta.glob<PluginInstaller>('./installer/*_*.ts', {
  eager: true,
  import: 'default'
})
const installers = sortBy(Object.entries(rawInstallers), ([fname]) => Number(fname.match(/[\d\.]+(?=_)/)?.[0])).map(v => v[1])


export const installPlugin = async (input: string) => {
  const matched = installers.filter(ins => ins.isMatched(input))
  const bestMatched = matched.at(-1)
  if (!bestMatched) throw new Error('没有符合的安装器')

  const meta = await bestMatched.install(input)
  await PluginArchiveMetaDB.upsert(meta)
}

export const updatePlugin = async (pluginMeta: PluginArchiveMeta) => {
  const matched = installers.find(v => v.name == pluginMeta.installerName)
  if (!matched) throw new Error('没有符合的安装器')

  const newMeta = await matched.update(pluginMeta)
  await PluginArchiveMetaDB.upsert(newMeta)
}

export abstract class PluginLoader {
  public abstract load(pluginMeta: PluginArchiveMeta): Promise<any>
}

const rawLoaders = import.meta.glob<PluginLoader>('./loader/_*.ts', {
  eager: true,
  import: 'default'
})
const loaders = Object.fromEntries(Object.entries(rawLoaders).map(([fname, loader]) => [fname.replace(/\.ts$/, '').replace(/^_/, ''), loader] as const))

const loadings = reactive<Record<string, boolean>>({})
const { SharedFunction } = Utils.eventBus

export const loadPlugin = async (pluginMeta: PluginArchiveMeta) => {
  const store = usePluginStore()
  store.pluginSteps[pluginMeta.pluginName] = {
    now: {
      status: 'wait',
      stepsIndex: 0
    },
    steps: [{
      name: '等待',
      description: '插件载入中'
    }]
  }
  await loaders[pluginMeta.loaderName].load(pluginMeta)
  await until(() => loadings[pluginMeta.loaderName]).toBeTruthy()
  console.log(`[plugin bootPlugin] booting name "${pluginMeta.loaderName}"`)
}
SharedFunction.define(async cfg => {
  console.log('[plugin addPlugin] new plugin defined', cfg)
  await bootPlugin(cfg)
  loadings[cfg.name] = true
}, 'core', 'addPlugin')