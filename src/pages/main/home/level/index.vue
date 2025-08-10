<script setup lang='ts'>
import { useBikaStore } from '@/stores'

const bikaStore = useBikaStore()
bikaStore.$loadLevelboard()
</script>

<template>
  <RouterTab class="w-full" routerBase="/main/home/level" :items="[{
    title: '日榜',
    name: 'day'
  }, {
    title: '周榜',
    name: 'week'
  }, {
    title: '月榜',
    name: 'month'
  }, {
    title: '骑士榜',
    name: 'user'
  }]" />
  <div class="h-[calc(100%-44px)] w-full">
    <RouterView />
  </div>
</template>