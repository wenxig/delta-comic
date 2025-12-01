<script setup lang='ts'>
import { useContentStore } from '@/stores/content'
import { uni, Utils } from 'delta-comic-core'
import { computed, toRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { until } from '@vueuse/core'
import { historyDB } from '@/db/history'
import { useAppStore } from '@/stores/app'
const $route = useRoute()
const contentStore = useContentStore()
const $router = useRouter()


const ep = $route.params.ep.toString()
const id = $route.params.id.toString()
const contentType = $route.params.contentType.toString()

const page = computed(() => contentStore.history.get(contentStore.$createHistoryKey(contentType, id, ep))!)

contentStore.$load(contentType, id, ep)

const layout = computed(() => uni.content.ContentPage.getViewLayout(page.value.contentType))

const appStore = useAppStore()

console.log(page.value)

// history
const union = computed(() => page.value.union.value)
if (!union.value) var loading = Utils.message.createLoadingMessage()
until(union).toBeTruthy().then(() => {
  loading?.success()
  historyDB.$add({
    ep: union.value!.thisEp,
    item: toRaw(union.value!.toJSON())
  })
})
$router.beforeEach(() => {
  if (appStore.isFullScreen) {
    appStore.isFullScreen = false
    return false
  }
})

</script>

<template>
  <template v-if="union">
    <component :page :is="layout" v-if="layout">
      <template #view>
        <component :page :is="page.ViewComp" v-model:isFullScreen="appStore.isFullScreen" />
      </template>
    </component>
  </template>
</template>