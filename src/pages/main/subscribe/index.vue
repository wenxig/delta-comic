<script setup lang='ts'>
import { ArrowForwardIosRound } from '@vicons/material'
import { uni } from 'delta-comic-core'
import { computed } from 'vue'

const subscribe = computed(() => Array.from(uni.user.User.subscribes.entries()))
</script>

<template>
  <NScrollbar class="!size-full">
    <div
      class="w-full pt-safe relative flex justify-center h-15 text-lg font-semibold items-end van-hairline--bottom bg-(--van-background-2)">
      <span class="pb-1">关注</span>
    </div>
    <div class="w-full text-nowrap flex justify-around bg-(--van-background-2) h-fit py-1">
      <NButton tertiary type="tertiary" size="tiny" class="!w-[calc(50%-5px)]">
        全部
      </NButton>
      <NButton tertiary type="tertiary" size="tiny" class="!w-[calc(50%-5px)]">
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
  </NScrollbar>
</template>