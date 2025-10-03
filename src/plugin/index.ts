import { Utils } from "delta-comic-core"
import { usePluginStore } from "./store"
const { SharedFunction } = Utils.eventBus

SharedFunction.define(async cfg => {
  console.log('[plugin] new plugin defined', cfg)
  const store = usePluginStore()
  const i = await store.$loadPlugin(cfg)
  return {
    api: i.api
  }
}, 'core', 'addPlugin')

export const bootPlugin = () => {
  const store = usePluginStore()
  return Promise.all(Array.from(store.savedPluginCode.values()).map(async ({ content: code }, name) => {
    const script = document.createElement('script')
    script.innerHTML = code
    document.body.appendChild(script)
    const r = Promise.withResolvers<void>()
    console.log(`[plugin] booting name "${name}"`)
    r.resolve()
    return r.promise
  }))
}