<script setup lang='ts'>
import { FavouriteItem, FavouriteValue, useFavouriteStore } from '@/db/favourite'
import { useContentStore } from '@/stores/content';
import { ArrowForwardIosRound } from '@vicons/material'
import { sortBy } from 'lodash-es';
import { computed } from 'vue'
import { useRouter } from 'vue-router';
const $props = defineProps<{
  isCardMode?: boolean
  item: FavouriteItem
}>()

const favouriteStore = useFavouriteStore()
const favouriteItems = computed(() => sortBy([...favouriteStore.favouriteItem.values()].filter(v => v.belongTo.includes($props.item.key)),v=>v.addtime).toReversed())


const $router = useRouter()
const contentStore = useContentStore()
const handleClick = (item: FavouriteValue) => {
  if (item.type == 'video') {
    contentStore.$load('cosav', item.id)
    $router.force.push(`/video/${item.id}`)
    return
  }
  contentStore.$load(Number.isNaN(Number(item.id)) ? 'bika' : 'jm', item.id)
  $router.force.push(`/comic/${item.id}`)
}
</script>

<template>
  <div v-if="isCardMode"
    class="min-h-62 overflow-hidden w-full rounded-xl flex flex-col bg-center bg-(--van-background-2) text-(--van-text-color) border-none relative active:bg-gray p-3 items-center van-haptics-feedback">
    <div class="flex items-center h-6 w-full relative">
      <div class="text-lg font-semibold">{{ item.title }}</div>
      <div class="flex items-center text-xs text-(--van-text-color-2) right-1 absolute">
        {{ favouriteItems.length }}个内容
        <NIcon size="var(--text-sm)">
          <ArrowForwardIosRound />
        </NIcon>
      </div>
    </div>
    <div class="flex mt-3 justify-around">
      <div v-for="v of favouriteItems.slice(0, 3)" class="flex flex-col !w-[30%] gap-2 " @click="handleClick(v)">
        <Image :src="v.cover" class="!rounded-lg z-2" fit="cover"
          :class="[v.type == 'video' ? 'aspect-video' : 'aspect-3/4 ']" />
        <div class="van-multi-ellipsis--l2">{{ v.title }}</div>
      </div>
    </div>
  </div>
</template>