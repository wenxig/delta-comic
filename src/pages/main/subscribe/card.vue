<script setup lang='ts'>
import { MoreVertRound } from '@vicons/material'
import { Comp, uni, Utils } from 'delta-comic-core'
import { isString } from 'es-toolkit'

defineProps<{
  item: uni.item.Item
}>()
defineEmits<{
  unsubscribe: []
}>()
</script>

<template>
  <div class="w-full van-hairline--bottom  bg-(--van-background-2)"
    @click="Utils.eventBus.SharedFunction.call('routeToContent', item.contentType, item.id, item.thisEp.index, item)">
    <!-- user -->
    <div class="w-full flex py-2 relative">
      <div class="van-ellipsis w-fit text-(--p-color) text-[16px] flex items-center pl-2">
        <Comp.Var :value="item.author[0].icon" v-slot="{ value }">
          <div class="size-10 rounded-full flex items-center justify-center bg-gray-200 aspect-square"
            v-if="isString(value)">
            <NIcon color="var(--p-color)" size="calc(var(--spacing) * 6.5)">
              <component :is="uni.item.Item.getAuthorIcon(item.author[0].$$plugin, value)" />
            </NIcon>
          </div>
          <Comp.Image class="size-8.5 shrink-0 mx-3 aspect-square" v-else :src="uni.image.Image.create(value)" round
            fit="cover" />
        </Comp.Var>
        <div class="flex flex-col w-full text-nowrap ml-1">
          <div class="text-(--nui-primary-color) flex items-center">
            {{ item.author[0].label }}
          </div>
          <div class="-mt-0.5 text-(--van-text-color-2) text-[11px] flex items-center">
            {{ Utils.translate.createDateString(item.$updateTime) }}·投稿了内容
          </div>
        </div>
      </div>
      <NButton class="!absolute right-3 top-1/2 -translate-y-1/2" type="tertiary" text>
        <template #icon>
          <VanPopover placement="bottom-end" :actions="[{ text: '取消关注', onClick() { $emit('unsubscribe') } }]"
            @select="q => q.onClick()">
            <template #reference>
              <NIcon size="20px">
                <MoreVertRound />
              </NIcon>
            </template>
          </VanPopover>
        </template>
      </NButton>
    </div>
    <!-- cover -->
    <div class="w-full px-2">
      <Comp.Image :src="item.$cover" class="aspect-video bg-black w-full rounded-lg" fit="contain" />
    </div>
    <!-- title -->
    <div class="w-full van-multi-ellipsis--l2 px-2 font-semibold text-base">
      {{ item.title }}
    </div>
    <!-- action -->
    <div class="w-full h-fit flex items-center px-2 py-1 justify-around">
      <NButton quaternary type="tertiary" size="large">
        <template #icon>
          <VanIcon name="share-o" />
        </template>
        转发
      </NButton>
      <NButton quaternary type="tertiary" size="large">
        <template #icon>
          <VanIcon name="share-o" />
        </template>
        转发
      </NButton>
      <NButton quaternary type="tertiary" size="large">
        <template #icon>
          <VanIcon name="share-o" />
        </template>
        转发
      </NButton>
    </div>
  </div>
</template>