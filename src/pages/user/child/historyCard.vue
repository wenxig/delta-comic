<script setup lang='ts'>
import { uni } from '@/api/union'
import { HistoryItem } from '@/db/history'

const $props = defineProps<{
  item: HistoryItem
  height: number
}>()
</script>

<template>
  <ComicCard v-if="uni.comic.Comic.is($props.item.value)" :height :comic="$props.item.value" />
  <VideoCard v-else :height :video="$props.item.value" />
</template>