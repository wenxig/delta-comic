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
  await bootPlugin(shallowRef(0))
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
      <NFloatButton @click="boot" v-if="!isEmpty(pluginStore.savedPluginCode)" :right="10" :bottom="10"
        class="!z-100000" type="primary" shape="circle">
        <NIcon :size="25">
          <CheckRound />
        </NIcon>
      </NFloatButton>
    </NSpin>
  </Comp.Popup>
</template>