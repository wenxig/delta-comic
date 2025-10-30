<script setup lang='ts'>
import { usePluginStore } from '@/plugin/store'
import { MenuRound } from '@vicons/material'
import { Comp, Utils } from 'delta-comic-core'

const pluginStore = usePluginStore()
</script>

<template>
  <Comp.Content :source="Utils.data.PromiseContent.resolve(pluginStore.savedPluginCode)" class="size-full">
    <NScrollbar class="size-full">
      <TransitionGroup tag="ul" name="list">
        <NCard v-for="plugin of pluginStore.savedPluginCode" :key="plugin.name" :title="plugin.displayName"
          header-class="!pt-1 !pb-0 !px-3" content-class="!pb-1 !px-3"
          :class="[plugin.enable ? '!border-(--nui-primary-color)/20 !bg-(--nui-primary-color-hover)/10' : '!bg-(--nui-icon-color-disabled)/20 !border-(--nui-icon-color-pressed)/20 ']"
          class="!w-[calc(100%-6px)] mx-auto mt-1 !duration-100">
          <template #header-extra>
            <!-- n-base-select-menu__empty -->
            <span class="text-(--text-color-3) italic font-light">{{ plugin.enable ? '已启用' : '未启用' }}</span>
            <VanPopover :actions="[{
              text: plugin.enable ? '禁用' : '启用',
              onClick: () => void pluginStore.$changePluginEnable(plugin.name)
            }, {
              text: '删除',
              onClick: () => void pluginStore.$removePlugin(plugin.name)
            }].concat(plugin.updateUrl ? [{
              text: '从下载源更新',
              onClick: () => void Utils.message.createLoadingMessage().bind(pluginStore.$addPluginFromNet(plugin.updateUrl!))
            }] : [])" placement="left-start" @select="v => v.onClick()">
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
            v{{ plugin.version.replace(/^v/g, '') }}
          </span>
          <span class="text-(--nui-text-color-3)">{{ plugin.description }}</span>
        </NCard>
      </TransitionGroup>
    </NScrollbar>
  </Comp.Content>
</template>