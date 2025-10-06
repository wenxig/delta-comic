<script setup lang='ts'>
import { useContentStore } from '@/stores/content'
import { until } from '@vueuse/core'
import { uni } from 'delta-comic-core'
import { computed } from 'vue'

const contentStore = useContentStore()
const page = computed(() => contentStore.now!)

const layout = computed(() => uni.content.ContentPage.getViewLayout(page.value.contentType))
uni.content.ContentPage
</script>

<template>
  <component :page :is="layout" v-if="layout">
    <template #view>
      <component :page :is="page.ViewComp" />
    </template>
  </component>
</template>