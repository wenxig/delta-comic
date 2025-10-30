<script setup lang='ts'>
import { AutoAwesomeMosaicFilled, CheckRound, FileDownloadRound } from '@vicons/material'
import { Comp } from 'delta-comic-core'
import { MenuOption, NIcon } from 'naive-ui'
import type { Component } from 'vue'
import { h, shallowRef } from 'vue'
import List from './list.vue'
import Download from './download.vue'
import { usePluginStore } from '@/plugin/store'
import { isEmpty } from 'es-toolkit/compat'
import { bootPlugin } from '@/plugin'
import { SafetyOutlined } from '@vicons/antd'
import { motion } from 'motion-v'

const pluginStore = usePluginStore()
const show = defineModel<boolean>('show', { required: true })
const isBooted = defineModel<boolean>('isBooted', { required: true })
const pageSelect = shallowRef<(typeof menuOptions)[number]['key']>('list')
const renderIcon = (icon: Component) => () => h(NIcon, null, { default: () => h(icon) })

const menuOptions = [
  {
    label: '管理',
    key: 'list',
    icon: renderIcon(AutoAwesomeMosaicFilled),
    comp: List
  },
  {
    label: '安装',
    key: 'download',
    icon: renderIcon(FileDownloadRound),
    comp: Download
  }
] satisfies MenuOption[]
const isBooting = shallowRef(false)
const boot = async (safe = false) => {
  if (isBooting.value || isBooted.value) return
  isBooting.value = true
  window.$$safe$$ = safe
  await bootPlugin()
  isBooted.value = true
  show.value = false
}
</script>

<template>
  <Comp.Popup v-model:show="show" position="bottom" round class="h-[80vh]" :before-close="() => !isBooting">
    <NSpin :show="isBooting" class="size-full *:first:size-full relative">
      <div class="size-full flex flex-col">
        <NMenu v-model:value="pageSelect" mode="horizontal" :options="menuOptions" responsive />
        <VanTabs v-model:active="pageSelect" swipeable :show-header="false"
          class="!size-full *:!size-full *:*:!size-full *:*:*:!size-full">
          <VanTab v-for="menu in menuOptions" :name="menu.key" class="!size-full *:!size-full">
            <component :is="menu.comp" />
          </VanTab>
        </VanTabs>
      </div>
      <NFloatButton v-if="!isEmpty(pluginStore.savedPluginCode)" :right="10" :bottom="10" class="!z-100000"
        type="primary" shape="circle" menu-trigger="click">
        <NIcon :size="25">
          <CheckRound />
        </NIcon>
        <template #menu>
          <NFloatButton>
            <NIcon :size="25" @click="boot(true)">
              <SafetyOutlined />
            </NIcon>
          </NFloatButton>
          <NFloatButton @click="boot(false)" type="primary">
            <NIcon :size="25">
              <CheckRound />
            </NIcon>
          </NFloatButton>
        </template>
      </NFloatButton>
      <template #description>
        <motion.div :initial="{ opacity: '0', translateY: '85px' }" :exit="{ opacity: '0', translateY: '85px' }"
          :animate="{ opacity: '100', translateY: '0px' }">
          <VanCellGroup class="w-[80vw] h-80 shadow-2xl" inset>
            <template v-for="[plugin, { steps, now }] in Object.entries(pluginStore.pluginSteps)">
              <template v-if="steps[now.stepsIndex]">
                <VanCell :title="pluginStore.$getPluginDisplayName(plugin)"
                  :label="`${steps[now.stepsIndex].name}: ${steps[now.stepsIndex].description}`" :value="now.status" />
              </template>
            </template>
          </VanCellGroup>
        </motion.div>
      </template>
    </NSpin>
  </Comp.Popup>
</template>