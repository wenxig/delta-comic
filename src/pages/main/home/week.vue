<script setup lang='ts'>
import { jm } from '@/api/jm'
import Waterfall from '@/components/waterfall.vue'
import { useJmStore } from '@/stores'
import { useTemp } from '@/stores/temp'
import symbol from '@/symbol'
import { RPromiseContent } from '@/utils/data'
import { SmartAbortController } from '@/utils/request'
import { isUndefined } from 'lodash-es'
import { inject, shallowRef, watch } from 'vue'
import { ComponentExposed } from 'vue-component-type-helpers'
const temp = useTemp().$apply('weekBest', () => [] as [select?: number, selectType?: string, source?: RPromiseContent<jm.comic.CommonComic[]>])
const jmStore = useJmStore()
const stopper = new SmartAbortController()
watch(() => [temp[0], temp[1]] as const, ([t0, t1], __, onCancel) => {
  onCancel(() => {
    stopper.abort()
  })
  if (isUndefined(t0) || isUndefined(t1)) return
  temp[2] = jm.api.search.getWeekBestComic(t0, t1, stopper.signal)
}, { immediate: true })

const list = shallowRef<ComponentExposed<typeof Waterfall>>()
const showNavBar = inject(symbol.showMainHomeNavBar)!
watch(() => list.value?.scrollTop, async (scrollTop, old) => {
  if (!scrollTop || !old) return
  if (scrollTop - old > 0) showNavBar.value = false
  else showNavBar.value = true
}, { immediate: true })
</script>

<template>
  <div class="flex flex-col size-full overflow-hidden">
    <div class="flex bg-(--van-background-2) shadow-lg z-1">
      <NSelect filterable clearable v-model:value="temp[0]"
        :options="jmStore.preload.weekBest.data.value?.categories.map(v => ({ key: Number(v.id), value: Number(v.id), label: v.title || v.time }))" />
      <NSelect filterable clearable v-model:value="temp[1]" class="!w-30"
        :options="jmStore.preload.weekBest.data.value?.type.map(v => ({ key: v.id, value: v.id, label: v.title }))" />
    </div>
    <Waterfall ref="list" :source="{ data: temp[2], isEnd: true }" v-if="temp[2]" class="size-full"
      v-slot="{ item: comic }">
      <ComicCard :comic type="small" :height="false" />
    </Waterfall>
  </div>
</template>