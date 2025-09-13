<script setup lang='ts'>
import { FavouriteItem, FavouriteValue, useFavouriteStore } from '@/db/favourite'
import { useContentStore } from '@/stores/content'
import { LockOutlined } from '@vicons/antd'
import { ArrowForwardIosRound } from '@vicons/material'
import { isEmpty, sortBy } from 'lodash-es'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
const $props = defineProps<{
  isCardMode?: boolean
  item: FavouriteItem
}>()

const favouriteStore = useFavouriteStore()
const favouriteItems = computed(() => sortBy([...favouriteStore.favouriteItem.values()].filter(v => v.belongTo.includes($props.item.key)), v => v.addtime).toReversed())


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
  <div v-if="isCardMode" @click="$router.force.push(`/user/favourite/${item.key}`)"
    class="overflow-hidden w-full rounded-xl flex flex-col bg-center bg-(--van-background-2) text-(--van-text-color) border-none relative active:bg-gray p-3 items-center van-haptics-feedback">
    <div class="flex items-center h-6 w-full relative">
      <div class="text-lg font-semibold">{{ item.title }}</div>
      <div class="flex items-center text-[13px] text-(--van-text-color-2) right-1 absolute">
        <template v-if="item.private">
          <NIcon size="16px">
            <LockOutlined />
          </NIcon>
          <span class="mx-1">·</span>
        </template>
        {{ favouriteItems.length }}个内容
        <NIcon size="15px">
          <ArrowForwardIosRound />
        </NIcon>
      </div>
    </div>
    <div class="flex mt-3 justify-around">
      <template v-if="isEmpty(favouriteItems)">
        <NEmpty description="无结果" class="w-full !justify-center" />
      </template>
      <template v-else>
        <div v-for="v of favouriteItems.slice(0, 3)" class="flex flex-col !w-[30%] gap-2 " @click="handleClick(v)">
          <Image :src="v.cover" class="!rounded-lg z-2" fit="cover"
            :class="[v.type == 'video' ? 'aspect-video' : 'aspect-3/4 ']" />
          <div class="van-multi-ellipsis--l2">{{ v.title }}</div>
        </div>
      </template>
    </div>
  </div>
  <div v-else @click="$router.force.push(`/user/favourite/${item.key}`)"
    class="overflow-hidden min-h-25 w-full rounded-xl flex bg-center bg-(--van-background-2) text-(--van-text-color) border-none relative active:bg-gray p-3 items-center van-haptics-feedback">
    <div class="w-[40%]">
      <Image :src="favouriteItems[0].cover" class="!rounded-lg z-2 h-full ml-[1%]"
        :class="[favouriteItems[0].type == 'video' ? 'aspect-video' : 'aspect-3/4']" fit="contain" />
    </div>
    <div class=" size-full flex ml-2">
      <div class="absolute w-full top-1 text-lg font-semibold">
        {{ item.title }}
      </div>
      <div class="absolute w-full bottom-4 text-sm flex items-center text-(--van-text-color-2)">
        <template v-if="item.private">
          <NIcon size="16px">
            <LockOutlined />
          </NIcon>
          <span class="mx-0.5">·</span>
        </template>
        {{ favouriteItems.length }}个内容
      </div>
    </div>
  </div>
</template>