<script setup lang='ts'>
import { shallowRef, computed } from 'vue'
import { usePluginStore } from './plugin/store'
import { useDialog, useLoadingBar, useMessage, useThemeVars } from 'naive-ui'
import { useStyleTag } from "@vueuse/core"
import { motion } from 'motion-v'
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
</script>

<template>
  <div class="fixed top-0 left-0 flex justify-center size-full bg-white overflow-hidden">
    <img src="/setup.avif" class="w-[95%] object-scale-down -mt-[30%]">
    <div class="absolute bottom-16 font-semibold text-2xl text-(--p-color)">Delta Comic</div>
  </div>
  <motion.div class="fixed shadow-2xl -translate-x-1/2 rounded-sm" :animate="{ width: '80vw', height: '20vh', left: '50%', bottom: '4rem' }"></motion.div>
</template>