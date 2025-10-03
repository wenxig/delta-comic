<script setup lang='ts'>
import { shallowRef, computed } from 'vue'
import { usePluginStore } from './plugin/store'
import { useDialog, useLoadingBar, useMessage, useThemeVars } from 'naive-ui'
import { useStyleTag } from "@vueuse/core"
import { motion } from 'motion-v'
import { Comp } from 'delta-comic-core'
import PluginAdd from './components/pluginAdd.vue'
import { bootPlugin } from './plugin'
window.$message = useMessage()
window.$loading = useLoadingBar()
window.$dialog = useDialog()
const cssVars = useThemeVars()
const injectStyle = computed(() => {
  let css = 'body {\n'
  for (const key in cssVars.value) {
    const styleValue = cssVars.value[key as keyof typeof cssVars.value]
    const styleKey = `--nui-${key
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
      .replace(/([a-zA-Z])([0-9])/g, '$1-$2')
      .replace(/([0-9])([a-zA-Z])/g, '$1-$2')
      .toLowerCase()}`
    css += `${styleKey}: ${styleValue};\n`
  }
  css += '}'
  return css
})
useStyleTag(injectStyle)
const App = shallowRef<typeof import('./App.vue').default>()
const loadApp = async () => App.value = (await import('./App.vue')).default

const pluginStore = usePluginStore()
const isEmpty = computed(() => pluginStore.savedPluginCode.size == 0)
const showAddPluginPopup = shallowRef(isEmpty.value)

const isBooting = shallowRef(false)

const boot = async (safe = false) => {
  isBooting.value = true
  window.$$safe$$ = safe
  await bootPlugin()
  console.log('[plugin] all load done')
  await loadApp()
  isBooting.value = false
  isBooted.value = true
}
const isBooted = shallowRef(false)
</script>

<template>
  <template v-if="!isBooted">
    <div class="fixed top-0 left-0 flex justify-center size-full bg-white overflow-hidden">
      <img src="/setup.avif" class="w-[95%] object-scale-down -mt-[30%]">
      <div class="absolute bottom-16 font-semibold text-2xl text-(--p-color)">Delta Comic</div>
    </div>
    <Comp.Popup :closeable="false" v-model:show="showAddPluginPopup" class="fixed" position="bottom" round>
      <PluginAdd />
    </Comp.Popup>
    <motion.div class="fixed shadow-2xl -translate-x-1/2 rounded-sm bg-white flex flex-col"
      :animate="{ width: '80vw', height: '20vh', left: '50%', bottom: '4rem' }">
      <Comp.List :item-height="30" :source="[...pluginStore.savedPluginCode.keys()].map(v => ({ name: v }))"
        v-slot="{ data: { item }, height }" class="h-full">
        <div :style="{ height: `${height}px` }" @click="pluginStore.savedPluginCode.delete(item.name)"
          class="w-full pl-2 h-full font-semibold text-lg van-hairline--bottom flex items-center gap-3">
          <NIcon>
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"
                d="M413.66 246.1H386a2 2 0 0 1-2-2v-77.24A38.86 38.86 0 0 0 345.14 128H267.9a2 2 0 0 1-2-2V98.34c0-27.14-21.5-49.86-48.64-50.33a49.53 49.53 0 0 0-50.4 49.51V126a2 2 0 0 1-2 2H87.62A39.74 39.74 0 0 0 48 167.62V238a2 2 0 0 0 2 2h26.91c29.37 0 53.68 25.48 54.09 54.85c.42 29.87-23.51 57.15-53.29 57.15H50a2 2 0 0 0-2 2v70.38A39.74 39.74 0 0 0 87.62 464H158a2 2 0 0 0 2-2v-20.93c0-30.28 24.75-56.35 55-57.06c30.1-.7 57 20.31 57 50.28V462a2 2 0 0 0 2 2h71.14A38.86 38.86 0 0 0 384 425.14v-78a2 2 0 0 1 2-2h28.48c27.63 0 49.52-22.67 49.52-50.4s-23.2-48.64-50.34-48.64z">
              </path>
            </svg>
          </NIcon>
          {{ item.name }}
        </div>
      </Comp.List>
      <NButtonGroup class="w-full bg-white">
        <NButton type="primary" size="large" :loading="isBooting" :disabled="isBooting || isEmpty" @click="boot()">启动
        </NButton>
        <NButton type="primary" secondary size="large" :loading="isBooting" :disabled="isBooting || isEmpty"
          @click="boot(true)">安全启动
        </NButton>
        <NButton secondary size="large" :disabled="isBooting || showAddPluginPopup" @click="showAddPluginPopup = true">
          添加插件
        </NButton>
      </NButtonGroup>
    </motion.div>
  </template>
  <component :is="App" v-else />
</template>