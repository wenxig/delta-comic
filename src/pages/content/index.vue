<script setup lang='ts'>
import { useContentStore } from '@/stores/content'
import { uni } from 'delta-comic-core'
import { computed, toRaw } from 'vue'
import { useRoute } from 'vue-router'
import { until, useFullscreen } from '@vueuse/core'
import { historyDB } from '@/db/history'
const $route = useRoute()
const contentStore = useContentStore()
const page = computed(() => contentStore.now!)

const layout = computed(() => uni.content.ContentPage.getViewLayout(page.value.contentType))

// un-catch handle

const ep = $route.params.ep.toString()
const id = $route.params.id.toString()
const contentType = $route.params.contentType.toString()
contentStore.$load(contentType, id, ep)

const { isFullscreen: isFullScreen } = useFullscreen()

// history
const union = computed(() => page.value.union.value)
until(union).toBeTruthy().then(() => {
  console.log(union.value)
  historyDB.$add({
    ep: {
      $$plugin: page.value.plugin,
      name: '',
      index: ep
    },
    item: toRaw(union.value!.toJSON())
  })
})
</script>

<template>
  <template v-if="union">
    <component :page :is="layout" v-if="layout">
      <template #view>
        <component :page :is="page.ViewComp" v-model:isFullScreen="isFullScreen" />
      </template>
    </component>
  </template>
</template>