<script setup lang='ts'>
import { useTemp } from '@/stores/temp'
import { isEmpty } from 'lodash-es'
import { inject, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import symbol from '@/symbol'
import Waterfall from '@/components/waterfall.vue'
import { until, useResizeObserver } from '@vueuse/core'
import { uni } from '@/api/union'
const waterfall = useTemplateRef('waterfall')
const $router = useRouter()
const temp = useTemp().$applyRaw('randomConfig', () => ({
  stream: uni.api.search.createRandomStream(),
  scroll: 0
}))

const containBound = ref<DOMRectReadOnly>()
useResizeObserver(() => <HTMLDivElement | null>waterfall.value?.scrollParent?.firstElementChild, ([b]) => containBound.value = b.contentRect)
onMounted(async () => {
  if (!isEmpty(temp.stream._data)) {
    await until(() => (containBound.value?.height ?? 0) > 8).toBeTruthy()
    waterfall.value?.scrollParent?.scroll(0, temp.scroll)
  }
})
const stop = $router.beforeEach(() => {
  stop()
  temp.scroll = waterfall.value?.scrollTop ?? 0
})

const showNavBar = inject(symbol.showNavBar)!
watch(() => waterfall.value?.scrollTop, async (scrollTop, old) => {
  if (!scrollTop || !old) return
  if (scrollTop - old > 0) showNavBar.value = false
  else showNavBar.value = true
}, { immediate: true })
</script>

<template>
  <Waterfall class="w-full" :source="temp.stream" v-slot="{ item: comic, index }" ref="waterfall">
    <ComicCard type="small" :height="false" :key="`${index}|${comic.toUniComic().id}`" :comic />
  </Waterfall>
</template>