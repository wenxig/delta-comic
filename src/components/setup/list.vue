<script setup lang='ts'>
import { SavedPluginCode, usePluginStore } from '@/plugin/store'
import { MenuRound, WarningRound } from '@vicons/material'
import { Comp, Utils, version } from 'delta-comic-core'
import { shallowReactive } from 'vue'
import semver from 'semver'
import { memoize } from 'es-toolkit'

const pluginStore = usePluginStore()

const updating = shallowReactive(new Set<string>())
const updatePlugin = (plugin: SavedPluginCode) => Utils.message.createDownloadMessage('更新插件', async m => {
  if (updating.has(plugin.key)) throw new Error('已经在更新')
  updating.add(plugin.key)
  try {
    await pluginStore.$updatePlugin(plugin.key, m)
    updating.delete(plugin.key)
  } catch (error) {
    updating.delete(plugin.key)
  }
})

const checkIsSupport = memoize((supportCore: string) => semver.satisfies(version, supportCore))

const getCardClass = (plugin: SavedPluginCode) => {
  if (!plugin.enable)
    return '!bg-(--nui-icon-color-disabled)/20 !border-(--nui-icon-color-pressed)/20'
  if (checkIsSupport(plugin.version.supportCore))
    return '!border-(--nui-primary-color)/20 !bg-(--nui-primary-color-hover)/10'
  return '!border-(--nui-warning-color)/20 !bg-(--nui-warning-color-hover)/10'
}

</script>

<template>
  <Comp.Content :source="Utils.data.PromiseContent.resolve(pluginStore.savedPluginCode)" class="size-full">
    <NScrollbar class="size-full">
      <TransitionGroup tag="ul" name="list">
        <NCard v-for="plugin of pluginStore.savedPluginCode" :key="plugin.key"
          :title="pluginStore.$getPluginDisplayName(plugin.name.id) ?? '<unknown>'" header-class="!pt-1 !pb-0 !px-3"
          content-class="!pb-1 !px-3" :class="[getCardClass(plugin)]"
          class="!w-[calc(100%-6px)] mx-auto mt-1 !duration-100">
          <template #header-extra>
            <!-- n-base-select-menu__empty -->
            <span class="text-(--text-color-3) italic font-light">{{ plugin.enable ? '已启用' : '未启用' }}</span>
            <VanPopover :actions="[{
              text: plugin.enable ? '禁用' : '启用',
              onClick: () => void pluginStore.$changePluginEnable(plugin.key)
            }, {
              text: '删除',
              onClick: () => void pluginStore.$removePlugin(plugin.key)
            }, ...(plugin.updateUrl ? [{
              text: '从下载源更新',
              disabled: updating.has(plugin.key),
              onClick: () => updatePlugin(plugin)
            }] : [])]" placement="left-start" @select="v => v.onClick()">
              <template #reference>
                <NButton circle quaternary class="!ml-3">
                  <template #icon>
                    <NIcon>
                      <MenuRound />
                    </NIcon>
                  </template>
                </NButton>
              </template>
            </VanPopover>
          </template>
          <span class="text-(--nui-text-color-disabled) italic font-bold mr-3" v-if="plugin.version">
            {{ semver.valid(semver.coerce(plugin.version.plugin ?? 'v0')) }}
          </span>
          <span class="text-(--nui-text-color-3)">{{ plugin.description }}</span>
          <div class="w-full text-(--nui-text-color-disabled) text-xs -">适应核心版本: {{ plugin.version.supportCore }}</div>
          <div class="w-full flex gap-1 font-bold items-center mt-1 !text-sm" v-if="!checkIsSupport(plugin.version.supportCore)">
            <NIcon color="var(--nui-warning-color)" size="1.2rem">
              <WarningRound />
            </NIcon>
            插件不支持当前核心版本
          </div>
        </NCard>
      </TransitionGroup>
    </NScrollbar>
  </Comp.Content>
</template>