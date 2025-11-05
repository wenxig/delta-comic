<script setup lang='ts'>
import { AutoAwesomeMosaicFilled, CheckRound, FileDownloadRound } from '@vicons/material'
import { Comp, Utils } from 'delta-comic-core'
import { MenuOption, NIcon, useMessage } from 'naive-ui'
import type { Component } from 'vue'
import { h, shallowRef } from 'vue'
import List from './list.vue'
import Download from './download.vue'
import { usePluginStore } from '@/plugin/store'
import { isEmpty } from 'es-toolkit/compat'
import { bootPlugin } from '@/plugin'
import { ReloadOutlined, SafetyOutlined } from '@vicons/antd'
import { motion } from 'motion-v'
import { updateByApk, updateByHot } from '@/utils/appUpdate'

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
  if (isBooting.value || isBooted.value) return $message.warning('正在启动中')
  isBooting.value = true
  window.$$safe$$ = safe
  await bootPlugin()
  isBooted.value = true
  show.value = false
}

const $message = useMessage()

const isUpdating = shallowRef(false)
const updateApp = async (method: () => PromiseLike<void>) => {
  if (isUpdating.value) return $message.warning('正在更新中')
  isUpdating.value = true
  try {
    await Utils.message.createLoadingMessage('更新中').bind(method())
    isUpdating.value = false
  } catch (error) {
    isUpdating.value = false
    throw error
  }
}
const isShowMenu = shallowRef(false)

const closeMenuBefore = (v: any) => {
  isShowMenu.value = false
  return v
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
      <NFloatButton :right="10" :bottom="10" class="!z-100000" type="primary" shape="circle" menu-trigger="click"
        v-model:show-menu="isShowMenu">
        <NIcon :size="25">
          <CheckRound />
        </NIcon>
        <template #menu>
          <NPopover trigger="manual" :show="isShowMenu" placement="left-end" v-if="!isUpdating">
            <template #trigger>
              <NFloatButton class="!z-100000" @click="closeMenuBefore(updateApp(updateByApk))">
                <NIcon :size="20">
                  <ReloadOutlined />
                </NIcon>
              </NFloatButton>
            </template>
            Apk更新应用
          </NPopover>
          <NPopover trigger="manual" :show="isShowMenu" placement="left-end" v-if="!isUpdating">
            <template #trigger>
              <NFloatButton class="!z-100000" @click="closeMenuBefore(updateApp(updateByHot))" type="primary">
                <NIcon :size="20">
                  <ReloadOutlined />
                </NIcon>
              </NFloatButton>
            </template>
            热更新应用
          </NPopover>
          <template v-if="!isEmpty(pluginStore.savedPluginCode)">
            <NPopover trigger="manual" :show="isShowMenu" placement="left-end">
              <template #trigger>
                <NFloatButton class="!z-100000" @click="closeMenuBefore(boot(true))">
                  <NIcon :size="20">
                    <SafetyOutlined />
                  </NIcon>
                </NFloatButton>
              </template>
              安全启动
            </NPopover>
            <NPopover trigger="manual" :show="isShowMenu" placement="left-end">
              <template #trigger>
                <NFloatButton class="!z-100000" @click="closeMenuBefore(boot(false))" type="primary">
                  <NIcon :size="20">
                    <CheckRound />
                  </NIcon>
                </NFloatButton>
              </template>
              启动
            </NPopover>
          </template>
        </template>
      </NFloatButton>
      <template #description>
        <motion.div :initial="{ opacity: 0, scale: '50%', translateY: '85px' }"
          :exit="{ opacity: 0, scale: '50%', translateY: '85px' }"
          :animate="{ opacity: 1, scale: '100%', translateY: '0px' }">
          <VanCellGroup class="w-[80vw] h-80 shadow-2xl" inset>
            <TransitionGroup name="list" tag="ul" class="!size-full">
              <VanCell title="core" label="载入应用内容..." center key="core">
                <template #right-icon>
                  <VanLoading size="25px" />
                </template>
              </VanCell>
              <template v-for="[plugin, { steps, now }] in Object.entries(pluginStore.pluginSteps)">
                <VanCell :title="pluginStore.$getPluginDisplayName(plugin)" v-if="steps[now.stepsIndex]" :key="plugin"
                  :label="`${steps[now.stepsIndex - 1].name}: ${steps[now.stepsIndex - 1].description}`"
                  :class="[now.status == 'error' && '!bg-(--nui-error-color)/50']" />
              </template>
            </TransitionGroup>
          </VanCellGroup>
        </motion.div>
      </template>
    </NSpin>
  </Comp.Popup>
</template>
<style scoped lang='css'>
.list-move,
/* 对移动中的元素应用的过渡 */
.list-enter-active,
.list-leave-active {
  transition:
    transform 420ms cubic-bezier(.22, 1.5, .5, 1),
    opacity 240ms ease-out;
  will-change: transform, opacity;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

/* 确保将离开的元素从布局流中删除
  以便能够正确地计算移动的动画。 */
.list-leave-active {
  position: absolute;
}
</style>