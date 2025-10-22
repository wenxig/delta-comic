<script setup lang='ts'>
import { PluginUserActionPage } from 'delta-comic-core'
import { NGrid } from 'naive-ui'
defineProps<{
  card: PluginUserActionPage
  pluginName: string
  color?: string
}>()
</script>

<template>
  <div class="w-full min-h-20 flex flex-col">
    <div class="w-full font-semibold">{{ card.title }}
      <span class="text-(--van-text-color-3) italic">#{{ pluginName }}</span>
    </div>
    <NGrid :cols="4" class="!w-full">
      <NGi v-for="item of card.items">
        <div class="flex flex-col justify-center items-center van-haptics-feedback" v-if="item.type == 'button'"
          @click="$router.force.push(`/user/action/${pluginName}/${item.key}`)">
          <NIcon size="2rem" :color="color || 'var(--bili-blue)'">
            <component :is="item.icon" />
          </NIcon>
          <span class="mt-1 text-(--van-text-color)">{{ item.name }}</span>
        </div>
      </NGi>
    </NGrid>
  </div>
</template>