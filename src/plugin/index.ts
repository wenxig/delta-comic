import { Utils } from "delta-comic-core"
import { usePluginStore } from "./store"
import { type ShallowRef } from "vue"
import { until } from "@vueuse/core"
const { SharedFunction } = Utils.eventBus

SharedFunction.define(async cfg => {
  const store = usePluginStore()
  store.pluginLoadingRecorder.done = false
  console.log('[plugin addPlugin] new plugin defined', cfg)
  store.pluginLoadingRecorder.name = cfg.name
  await store.$loadPlugin(cfg)
  store.pluginLoadingRecorder.done = true
}, 'core', 'addPlugin')

export const bootPlugin = async (bootStep: ShallowRef<number>) => {
  const store = usePluginStore()
  store.pluginLoadingRecorder.done = false
  bootStep.value = 0
  for (const [name, { content: code }] of store.savedPluginCode.entries()) {
    const script = document.createElement('script')
    script.innerHTML = `
    (function(){
      var _console = window.console;
      var console = {
        log(...args) {
          _console.log("[plugin->${name}]",...args)
        },
        warn(...args) {
          _console.warn("[plugin->${name}]",...args)
        },
        error(...args) {
          _console.error("[plugin->${name}]",...args)
        }
      };
      // --inject code done--
      ${code}
    })();
    `
    document.body.appendChild(script)
    console.log(`[plugin bootPlugin] booting name "${name}"`)
    await until(store.pluginLoadingRecorder).toMatch(v => v.done === true)
    bootStep.value++
  }
  console.log('[plugin bootPlugin] all load done')
}