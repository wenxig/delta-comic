<script setup lang='ts'>
import { FavouriteItem } from '@/db/favourite'
import { ArrowForwardIosRound } from '@vicons/material'

defineProps<{
  isCardMode?: boolean
  item: FavouriteItem
}>()
</script>

<template>
  <div v-if="isCardMode"
    class="min-h-62 overflow-hidden w-full rounded-xl flex flex-col bg-center bg-(--van-background-2) text-(--van-text-color) border-none relative active:bg-gray p-3 items-center van-haptics-feedback">
    <div class="flex items-center h-6 w-full relative">
      <div class="text-lg font-semibold">{{ item.title }}</div>
      <div class="flex items-center text-xs text-(--van-text-color-2) right-1 absolute">
        {{ item.value.length }}个内容
        <NIcon size="var(--text-sm)">
          <ArrowForwardIosRound />
        </NIcon>
      </div>
    </div>
    <div class="flex mt-3 justify-around">
      <div v-for="v of item.value.slice(0, 3)" class="flex flex-col !w-[30%] gap-2 ">
        <Image :src="v.cover" class="!rounded-lg z-2" fit="cover"
          :class="[v.type == 'video' ? 'aspect-video' : 'aspect-3/4 ']" />
        <div class="van-multi-ellipsis--l2">{{ v.title }}</div>
      </div>
    </div>
  </div>
</template>