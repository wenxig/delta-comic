<script setup lang='ts'>
import { usePluginStore } from '@/plugin/store'
import { MenuRound } from '@vicons/material'
import { Comp, Utils } from 'delta-comic-core'

const pluginStore = usePluginStore()
</script>

<template>
  <Comp.Content :source="Utils.data.PromiseContent.resolve(Array.from(pluginStore.savedPluginCode.values()))"
    class="size-full">
    <NScrollbar class="size-full">
      <TransitionGroup tag="ul" name="list">
        <NCard v-for="module of pluginStore.savedPluginCode.values()" :key="module.name" :title="module.name"
          header-class="!pt-1 !pb-0 !px-3" content-class="!pb-1 !px-3"
          :class="[module.enable ? '!border-(--nui-primary-color)/20 !bg-(--nui-primary-color-hover)/10' : '!bg-(--nui-icon-color-disabled)/20 !border-(--nui-icon-color-pressed)/20 ']"
          class="!w-[calc(100%-6px)] mx-auto mt-1 !duration-100">
          <template #header-extra>
            <!-- n-base-select-menu__empty -->
            <span class="text-(--text-color-3) italic font-light">{{ module.enable ? '已启用' : '未启用' }}</span>
            <NPopselect :options="[]" content-class="!p-0" class="!p-0 **:has-[.n-base-select-menu\_\_empty]:p-0"
              footer-class="!p-0" header-class="!p-0" trigger="click">
              <NButton circle quaternary class="!ml-3">
                <template #icon>
                  <NIcon>
                    <MenuRound />
                  </NIcon>
                </template>
              </NButton>
              <template #header>
              </template>
              <template #empty>
                <NButton class="!w-full" quaternary @click="pluginStore.$changePluginEnable(module.name)">
                  {{ module.enable ? '禁用' : '启用' }}
                </NButton>
              </template>
              <template #action>
              </template>
            </NPopselect>
          </template>
          <span class="text-(--nui-text-color-disabled) italic font-bold mr-3" v-if="module.version">
            v{{ module.version }}
          </span>
          <span class="text-(--nui-text-color-3)">{{ module.description }}</span>
        </NCard>
      </TransitionGroup>
    </NScrollbar>
  </Comp.Content>
</template>