<script setup lang='ts'>
import { random } from '@/stores/temp'
import { chunk, isEmpty } from 'lodash-es'
import { inject, nextTick, onMounted, reactive, shallowRef, watch } from 'vue'
import List from '@/components/list.vue'
import { useRouter } from 'vue-router'
import symbol from '@/symbol'
import { ComponentExposed } from 'vue-component-type-helpers'
import { createRandomComicStream } from '@/api/bika/api/search'
import Waterfall from '@/components/waterfall.vue'
import { BaseComic } from '@/api/bika/comic'
import ComicCard from '@/components/comic/comicCard.vue'
const list = shallowRef<ComponentExposed<typeof List>>()
const $router = useRouter()
const stream = random.stream ??= createRandomComicStream()
onMounted(async () => {
  if (!isEmpty(stream._data)) {
    await nextTick()
    list.value?.listInstance?.scrollTo({ top: random.scroll })
  }
})
const stop = $router.beforeEach(() => {
  stop()
  random.scroll = list.value?.scrollTop!
})

const showNavBar = inject(symbol.showNavBar)!
watch(() => list.value?.scrollTop, async (scrollTop, old) => {
  if (!scrollTop || !old) return
  if (scrollTop - old > 0) showNavBar.value = false
  else showNavBar.value = true
}, { immediate: true })
const sizeMap = reactive(new Map<BaseComic, number>())
</script>

<template>
  <Waterfall class="w-full" :source="stream" v-slot="{ item: comic }"
    :calc-item-height="item => sizeMap.get(item) ?? 290">
    <ComicCard type="small" :height="false" :comic @resize="(comic, height) => sizeMap.set(comic, height)"  />
  </Waterfall>
</template>