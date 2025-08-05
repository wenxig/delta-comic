<script setup lang='ts'>
import { random } from '@/stores/temp'
import { isEmpty } from 'lodash-es'
import { inject, nextTick, onMounted, reactive, ref, shallowRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import symbol from '@/symbol'
import { ComponentExposed } from 'vue-component-type-helpers'
import { createRandomComicStream } from '@/api/bika/api/search'
import Waterfall from '@/components/waterfall.vue'
import { BaseComic } from '@/api/bika/comic'
import ComicCard from '@/components/comic/comicCard.vue'
import { delay } from '@/utils/delay'
import { until, useResizeObserver } from '@vueuse/core'
const waterfall = shallowRef<ComponentExposed<typeof Waterfall>>()
const $router = useRouter()
const stream = random.stream ??= createRandomComicStream()
const containBound = ref<DOMRectReadOnly>()
useResizeObserver(() => <HTMLDivElement | null>waterfall.value?.scrollParent?.firstElementChild, ([b]) => containBound.value = b.contentRect)
onMounted(async () => {
  if (!isEmpty(stream._data)) {
    await until(() => (containBound.value?.height ?? 0) > 8).toBeTruthy()
    console.log(waterfall.value?.scrollParent?.clientHeight, waterfall.value?.scrollParent?.firstElementChild, waterfall.value?.scrollParent?.firstElementChild?.getBoundingClientRect().height, { top: random.scroll })
    waterfall.value?.scrollParent?.scroll(0, random.scroll)
  }
})
const stop = $router.beforeEach(() => {
  stop()
  random.scroll = waterfall.value?.scrollTop ?? 0
})

const showNavBar = inject(symbol.showNavBar)!
watch(() => waterfall.value?.scrollTop, async (scrollTop, old) => {
  if (!scrollTop || !old) return
  if (scrollTop - old > 0) showNavBar.value = false
  else showNavBar.value = true
}, { immediate: true })

</script>

<template>
  <Waterfall class="w-full" :source="stream" v-slot="{ item: comic }"
    :calc-item-height="item => random.size.get(item) ?? 290" ref="waterfall">
    <ComicCard type="small" :height="false" :comic @resize="(comic, height) => random.size.set(comic, height)" />
  </Waterfall>
</template>