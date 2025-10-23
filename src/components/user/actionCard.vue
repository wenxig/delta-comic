<script setup lang='ts'>
import { PluginUserActionPage } from 'delta-comic-core'
import { chunk } from 'es-toolkit'
defineProps<{
  card: PluginUserActionPage
  pluginName: string
  color?: string
}>()
</script>

<template>
  <div class="w-full min-h-20 flex flex-col">
    <div class="w-full font-semibold text-lg pl-4">{{ card.title }}
      <span class="text-(--van-text-color-3) italic text-[16px]">#{{ pluginName }}</span>
    </div>
    <div class="w-full h-20 flex justify-around items-center" v-for="items of chunk(card.items, 4)">
      <template v-for="item of items">
        <div class="flex flex-col justify-center items-center van-haptics-feedback" v-if="item.type == 'button'"
          @click="$router.force.push(`/user/action/${pluginName}/${item.key}`)">
          <NIcon size="2rem" :color="color || 'var(--bili-blue)'">
            <component :is="item.icon" />
          </NIcon>
          <span class="mt-1 text-(--van-text-color)">{{ item.name }}</span>
        </div>
      </template>
    </div>
  </div>
</template>