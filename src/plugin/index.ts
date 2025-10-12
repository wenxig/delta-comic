import { Utils } from "delta-comic-core"
import { usePluginStore, type PluginLoadingMicroSteps } from "./store"
import { reactive, type ShallowRef, type VNode } from "vue"
import { until } from "@vueuse/core"
const { SharedFunction } = Utils.eventBus
export type PluginLoadingRecorder = {
  name: string,
  done: boolean,
  mountEls: VNode[]
} & PluginLoadingMicroSteps
export const pluginLoading = reactive<PluginLoadingRecorder>({
  name: '',
  done: false,
  mountEls: [],

  allSteps: [],
  now: {
    status: 'wait',
    stepsIndex: 0
  },
})
SharedFunction.define(async cfg => {
  pluginLoading.done = false
  console.log('[plugin addPlugin] new plugin defined', cfg)
  pluginLoading.name = cfg.name
  const store = usePluginStore()
  await store.$loadPlugin(cfg, pluginLoading)
  pluginLoading.done = true
}, 'core', 'addPlugin')

export const bootPlugin = async (bootStep: ShallowRef<number>) => {
  const store = usePluginStore()
  pluginLoading.done = false
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
    await until(pluginLoading).toMatch(v => v.done === true)
    bootStep.value++
  }
  console.log('[plugin bootPlugin] all load done')
}