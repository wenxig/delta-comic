<script setup lang='ts'>
import { useContentStore } from '@/stores/content'
import { uni } from 'delta-comic-core'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
const $route = useRoute()
const contentStore = useContentStore()
const page = computed(() => contentStore.now!)

const layout = computed(() => uni.content.ContentPage.getViewLayout(page.value.contentType))

// un-catch handle

const ep = $route.params.ep.toString()
const id = $route.params.id.toString()
const contentType = $route.params.contentType.toString()
contentStore.$load(contentType, id, ep)
</script>

<template>
  <component :page :is="layout" v-if="layout">
    <template #view>
      <component :page :is="page.ViewComp" />
    </template>
  </component>
</template>