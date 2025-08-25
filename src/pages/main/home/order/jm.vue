<script setup lang='ts'>
import { useRoute, useRouter } from 'vue-router'
import { shallowRef, inject, watch, computed, onMounted, ref } from 'vue'
import symbol from '@/symbol'
import { ComponentExposed } from 'vue-component-type-helpers'
import Waterfall from '@/components/waterfall.vue'
import { useJmStore } from '@/stores'
import { RStream } from '@/utils/data'
import { jm } from '@/api/jm'
import { useTemp } from '@/stores/temp'
import { until, useResizeObserver } from '@vueuse/core'
import { isEmpty } from 'lodash-es'

const $route = useRoute()
const $router = useRouter()
const id = decodeURI($route.params.id.toString())
const jmStore = useJmStore()

const list = shallowRef<ComponentExposed<typeof Waterfall>>()
const showNavBar = inject(symbol.showMainHomeNavBar)!
watch(() => list.value?.scrollTop, async (scrollTop, old) => {
  if (!scrollTop || !old) return
  if (scrollTop - old > 0) showNavBar.value = false
  else showNavBar.value = true
}, { immediate: true })
const temp = useTemp()
const orderStoreSaveTemp = temp.$applyRaw(`orderJmStoreSave`, () => new Map<string, RStream<jm.comic.CommonComic>>())
const orderScoreSaveTemp = temp.$applyRaw(`orderJmScoreSave`, () => new Map<string, number>())
const containBound = ref<DOMRectReadOnly>()
useResizeObserver(() => <HTMLDivElement | null>list.value?.scrollParent?.firstElementChild, ([b]) => containBound.value = b.contentRect)
onMounted(async () => {
  if (!isEmpty(dataSource.value.data.value)) {
    await until(() => (containBound.value?.height ?? 0) > 8).toBeTruthy()
    list.value?.scrollParent?.scroll(0, orderScoreSaveTemp.get(id) ?? 0)
  }
})
const stop = $router.beforeEach(() => {
  stop()
  orderScoreSaveTemp.set(id, list.value?.scrollTop ?? 0)
})
const dataSource = computed(() => {
  if (!orderStoreSaveTemp.has(id)) orderStoreSaveTemp.set(id, jm.api.search.createPromoteStream(Number(id)).setupData(jmStore.preload.promote.data.value?.find(v => v.id == id)?.$content ?? []))
  return orderStoreSaveTemp.get(id)!
})
</script>

<template>
  <Waterfall :source="dataSource" v-slot="{ item }" ref="list">
    <ComicCard :comic="item" :height="false" type="small" />
  </Waterfall>
</template>