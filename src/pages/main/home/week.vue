<script setup lang='ts'>
import { jm } from '@/api/jm'
import { useJmStore } from '@/stores'
import { RPromiseContent } from '@/utils/data'
import { SmartAbortController } from '@/utils/request'
import { shallowRef, watchEffect } from 'vue'

const jmStore = useJmStore()
const select = shallowRef<number>()
const selectType = shallowRef<string>()
const source = shallowRef<RPromiseContent<jm.comic.CommonComic[]>>()
const stopper = new SmartAbortController()
watchEffect(onCancel => {
  onCancel(() => {
    stopper.abort()
  })
  if (!select.value || !selectType.value) return
  source.value = jm.api.search.getWeekBestComic(select.value, selectType.value, stopper.signal)
})
</script>

<template>
  <div class="flex flex-col size-full overflow-hidden">
    <div class="flex bg-(--van-background-2) shadow-lg z-1">
      <NSelect filterable clearable v-model:value="select"
        :options="jmStore.preload.weekBest.data.value?.categories.map(v => ({ key: Number(v.id), value: Number(v.id), label: v.title || v.time }))" />
      <NSelect filterable clearable v-model:value="selectType" class="!w-30"
        :options="jmStore.preload.weekBest.data.value?.type.map(v => ({ key: v.id, value: v.id, label: v.title }))" />
    </div>
    <Waterfall :source="{ data: source, isEnd: true }" v-if="source" class="size-full" v-slot="{ item: comic }">
      <ComicCard :comic type="small" :height="false" />
    </Waterfall>
  </div>
</template>