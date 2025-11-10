<script setup lang='ts'>
import { subscribeDb } from '@/db/subscribe'
import { useLiveQueryRef } from '@/utils/db'
import { ArrowForwardIosRound } from '@vicons/material'
import { Comp, uni } from 'delta-comic-core'
import { isString } from 'es-toolkit'
import {  shallowRef } from 'vue'
const isOnAllPage = shallowRef(true)
const subscribe = useLiveQueryRef(() => subscribeDb.all.toArray(), [])
</script>

<template>
  <NScrollbar class="!size-full">
    <div
      class="w-full pt-safe relative flex justify-center h-12 text-lg font-semibold items-end van-hairline--bottom bg-(--van-background-2)">
      <span class="pb-1">关注</span>
    </div>
    <div class="w-full text-nowrap flex justify-around bg-(--van-background-2) h-fit py-1">
      <NButton tertiary :type="isOnAllPage ? 'primary' : 'tertiary'" size="tiny" class="!w-[calc(50%-5px)]"
        @click="isOnAllPage = true">
        全部
      </NButton>
      <NButton tertiary :type="isOnAllPage ? 'tertiary' : 'primary'" size="tiny" class="!w-[calc(50%-5px)]"
        @click="isOnAllPage = false">
        追更
      </NButton>
    </div>
    <div class="w-full text-nowrap flex items-center bg-(--van-background-2) pb-3 pt-3 relative">
      <div class="font-semibold ml-3 h-fit">最常访问</div>
      <div class="flex items-center text-(--van-text-color-2) absolute right-3 !text-xs top-3">
        更多
        <NIcon>
          <ArrowForwardIosRound />
        </NIcon>
      </div>
    </div>
    <div class="w-full h-fit overflow-y-hidden overflow-x-auto scrollbar py-1 bg-(--van-background-2) flex gap-1 px-1">
      <div v-for="{ key, type, ...sub } of subscribe" class="h-full flex flex-col w-fit items-center justify-around">
        <template v-if="type == 'author'">
          <button class="size-12 rounded-full flex items-center justify-center bg-gray-200" @click=""
            v-if="isString(sub.author.icon)">
            <NIcon color="var(--p-color)" size="calc(var(--spacing) * 6.5)">
              <component :is="uni.item.Item.getAuthorIcon(key.split(':')[0], sub.author.icon)" />
            </NIcon>
          </button>
          <Comp.Image class="size-12 shrink-0 aspect-square" v-else :src="uni.image.Image.create(sub.author.icon)" round fit="cover" />
          <div class="text-wrap w-18 !text-xs mt-1 text-center !text-(--van-text-color-2)">{{ sub.author.label }}</div>
        </template>
      </div>
    </div>
  </NScrollbar>
</template>
<style scoped lang='css'>
.scrollbar::-webkit-scrollbar {
  display: none;
}

.scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
</style>