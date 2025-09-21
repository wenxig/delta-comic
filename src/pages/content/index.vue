<script setup lang='ts'>
import { useContentStore } from '@/stores/content'
import { until } from '@vueuse/core'
import { uni } from 'delta-comic-core'
import { computed } from 'vue'

const contentStore = useContentStore()
const page = computed(() => contentStore.now!)
await until(page).toBeTruthy()

const layout = computed(() => uni.item.Item.getViewLayout(page.value.contentType.layout))
</script>

<template>
  <component :is="layout" v-if="layout">
    <template #view>
      123
    </template>
  </component>
</template>