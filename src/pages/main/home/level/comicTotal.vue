<script setup lang='ts'>
import { computed, useTemplateRef } from 'vue'
import { useRoute } from 'vue-router'
import { inject, watch } from 'vue'
import List from '@/components/list.vue'
import symbol from '@/symbol'
import { ComponentExposed } from 'vue-component-type-helpers'
import { useConfig } from '@/config'
import { useBikaStore, useJmStore } from '@/stores'
import { computedWithControl } from '@vueuse/core'
const $route = useRoute()
enum ComicLevel {
  day,
  week,
  month,
}
const mode = computed(() => <keyof typeof ComicLevel>$route.path.substring($route.path.lastIndexOf('/') + 1))
const bikaStore = useBikaStore()
const jmStore = useJmStore()
const from = computed(() => <'jm' | 'bika' | 'total'>($route.query.from?.toString() || 'bika'))

const list = useTemplateRef<ComponentExposed<typeof List>>('list')
const showNavBar = inject(symbol.showMainHomeNavBar)!
watch(() => list.value?.scrollTop, async (scrollTop, old) => {
  if (!scrollTop || !old) return
  if (scrollTop - old > 0) showNavBar.value = false
  else showNavBar.value = true
}, { immediate: true })
const config = useConfig()
const source = computedWithControl(() => [from.value, bikaStore.levelboard, jmStore.levelboard, mode.value], () => {
  switch (from.value) {
    case 'bika':
      return bikaStore.levelboard.useProcessor(lv => lv.comics[ComicLevel[mode.value]].map(v => v.toUniComic()))
    case 'jm':
      return jmStore.levelboard.useProcessor(lv => lv[mode.value].map(v => v.toUniComic()))
    case 'total': throw new Error('not support')
  }
}, { deep: 2 })
const color = (index: number) => config.isDark ? 255 : (255 / 40) * (40 - (index + 1))
</script>

<template>
  <List :item-height="120" :source="{ data: source, isEnd: true }" item-resizable class="h-full w-full"
    v-slot="{ data: { item: comic, index }, height }" ref="list">
    <div class="flex" :style="`height: ${height}px;`">
      <div
        :style="[`background-color:rgba(219,54,124,${1 - (index * 0.1)});`, `color: rgb(${color(index)},${color(index)},${color(index)});`]"
        class="flex justify-center items-center text-3xl !w-[10%] van-hairline--top text-white">
        {{ index + 1 }}
      </div>
      <ComicCard :comic :height class="!w-[90%]" />
    </div>
  </List>
</template>