<script setup lang='ts'>
import { random } from '@/stores/temp'
import { chunk, isEmpty } from 'lodash-es'
import { inject, nextTick, onMounted, shallowRef, watch } from 'vue'
import List from '@/components/list.vue'
import { useRouter } from 'vue-router'
import symbol from '@/symbol'
import { ComponentExposed } from 'vue-component-type-helpers'
import { createRandomComicStream } from '@/api/bika/api/search'
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

</script>

<template>

  <List class="h-full w-full" :data-processor="v => chunk(v, 2)" :source="stream" :item-height="260"
    v-slot="{ data: { item: comics }, height }" ref="list">
    <div :style="{ height: `${height}px` }" class="w-full mt-1 flex justify-center *:w-[98%]">
      <div class="flex justify-between h-full">
        <ComicCard type="small" :height v-for="comic of comics" :comic />
      </div>
    </div>
  </List>
</template>