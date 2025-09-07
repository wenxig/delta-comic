<script setup lang='ts'>
import { FavouriteItem } from '@/db/favourite'

defineProps<{
  isCardMode?: boolean
  item: FavouriteItem
}>()
</script>

<template>
  <div v-if="isCardMode"
    class="overflow-hidden w-full rounded-xl flex flex-col bg-center bg-(--van-background-2) text-(--van-text-color) border-none relative active:bg-gray p-3 items-center van-haptics-feedback">
    <div class="flex items-center h-6 w-full relative">
      <div class="text-lg font-semibold">{{ item.title }}</div>

    </div>
    <div>
      <div v-for="v of item.value.slice(2)" class="flex flex-col !w-[30%] gap-5">
        <Image :src="v.cover" class="!rounded-lg z-2"
          :class="[v.type == 'video' ? 'aspect-video' : 'aspect-3/4 ']" fit="contain" ref="cover" />
        <div>{{ v.title }}</div>
      </div>
    </div>
  </div>
</template>