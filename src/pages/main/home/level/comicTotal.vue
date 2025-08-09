<script setup lang='ts'>
import { isEmpty } from 'lodash-es'
import { computed, useTemplateRef } from 'vue'
import { useRoute } from 'vue-router'
import { useBikaStore } from '@/stores'
import { shallowRef, inject, watch } from 'vue'
import List from '@/components/list.vue'
import symbol from '@/symbol'
import { ComponentExposed } from 'vue-component-type-helpers'
import { useConfig } from '@/config'
import { PromiseContent } from '@/utils/data'
const bikaStore = useBikaStore()
const $route = useRoute()
enum ComicLevel {
  day,
  week,
  month,
}
const mode = computed(() => <keyof typeof ComicLevel>$route.path.substring($route.path.lastIndexOf('/') + 1))
const data = computed(() => bikaStore.levelboard.data?.comics[ComicLevel[mode.value]] ?? [])


const list = useTemplateRef<ComponentExposed<typeof List>>('list')
const showNavBar = inject(symbol.showNavBar)!
watch(() => list.value?.scrollTop, async (scrollTop, old) => {
  if (!scrollTop || !old) return
  if (scrollTop - old > 0) showNavBar.value = false
  else showNavBar.value = true
}, { immediate: true })
const config = useConfig()
</script>

<template>
  <List :item-height="120"
    :source="{ data: PromiseContent.dataProcessor(bikaStore.levelboard, lv => lv.comics[ComicLevel[mode]]), isEnd: true }"
    item-resizable class="h-full w-full" v-slot="{ data: { item: comic, index }, height }" ref="list">
    <div class="flex" :style="`height: ${height}px;`">
      <div
        :style="[`background-color:rgba(219,54,124,${1 - (index * 0.1)});`, `color: rgb(${config.isDark ? 255 : (255 / 40) * (40 - (index + 1))},${config.isDark ? 255 : (255 / 40) * (40 - (index + 1))},${config.isDark ? 255 : (255 / 40) * (40 - (index + 1))});`]"
        class="flex justify-center items-center text-3xl !w-[10%] van-hairline--top text-white">
        {{ index + 1 }}
      </div>
      <ComicCard :comic :height class="!w-[90%]" />
    </div>
  </List>
</template>

<style scoped lang='scss'>
:deep(* *, *) {
  transition: all 0s !important;
}
</style>