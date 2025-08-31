<script setup lang='ts'>
import { useTemp } from '@/stores/temp'
import { inject, useTemplateRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import symbol from '@/symbol'
import { cosav } from '@/api/cosav'
import { NScrollbar } from 'naive-ui'
import { useCosavStore } from '@/stores'
import { chunk } from 'lodash-es'
const list = useTemplateRef('list')
const $router = useRouter()
const cosavStore = useCosavStore()
const temp = useTemp().$applyRaw('videoConfig', () => ({
  stream: cosav.api.search.createVideoHotStream(),
  scroll: 0
}))

const stop = $router.beforeEach(() => {
  stop()
  temp.scroll = list.value?.scrollbarInstRef?.containerScrollTop ?? 0
})

const showNavBar = inject(symbol.showMainHomeNavBar)!
watch(() => list.value?.scrollbarInstRef?.containerScrollTop, async (scrollTop, old) => {
  if (!scrollTop || !old) return
  if (scrollTop - old > 0) showNavBar.value = false
  else showNavBar.value = true
}, { immediate: true })
</script>

<template>
  <NScrollbar class="!size-full" ref="list">
    <Content :source="cosavStore.preload.settings">
      <Var :value="cosavStore.preload.settings.data.value!" v-slot="{ value }">
        <div v-for="block of value.$index_page" :key="block.key">
          <div class="w-[calc(100%-8px)] mx-auto relative flex items-center my-1 h-10 bg-(--van-background-2) rounded">
            <span class="ml-3 text-(--nui-primary-color) text-xl font-bold">{{ block.name }}</span>
          </div>
          <div class="flex gap-1 px-1">
            <div class="flex gap-1 flex-col w-full"
              v-for="videos of chunk(block.list, Math.floor(block.list.length / 2))">
              <VideoCard v-for="video of videos" :video :height="false" :key="video.id" type="small" />
            </div>
          </div>
        </div>
      </Var>
    </Content>
  </NScrollbar>
</template>