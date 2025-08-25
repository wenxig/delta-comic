<script setup lang='ts'>
import { useRoute, useRouter } from 'vue-router'
import { shallowRef, inject, watch, ref, computed } from 'vue'
import symbol from '@/symbol'
import { ComponentExposed } from 'vue-component-type-helpers'
import Waterfall from '@/components/waterfall.vue'
import { PromiseContent, RStream, Stream } from '@/utils/data'
import { useTemp } from '@/stores/temp'
import { useResizeObserver } from '@vueuse/core'
import { useCosavStore } from '@/stores'
import { cosav } from '@/api/cosav'

const $route = useRoute()
const $router = useRouter()
const cosavStore = useCosavStore()
const id = decodeURI($route.params.id.toString()).replace(/^video@/, '')


const list = shallowRef<ComponentExposed<typeof Waterfall>>()
const showNavBar = inject(symbol.showMainHomeNavBar)!
watch(() => list.value?.scrollTop, async (scrollTop, old) => {
  if (!scrollTop || !old) return
  if (scrollTop - old > 0) showNavBar.value = false
  else showNavBar.value = true
}, { immediate: true })
const temp = useTemp()
const orderVideoSaveTemp = temp.$applyRaw(`orderVideoSaveTemp`, () => new Map<string, number>())
const containBound = ref<DOMRectReadOnly>()
useResizeObserver(() => <HTMLDivElement | null>list.value?.scrollParent?.firstElementChild, ([b]) => containBound.value = b.contentRect)
const stop = $router.beforeEach(() => {
  stop()
  orderVideoSaveTemp.set(id, list.value?.scrollTop ?? 0)
})

const subCategoriesTemp = temp.$applyRaw(`subCategoriesTemp`, () => new Map<string, PromiseContent<cosav.search.CategoriesSubItem[]>>())
const subCategories = computed(() => {
  if (!subCategoriesTemp.has(id))
    subCategoriesTemp.set(id, cosav.api.search.getVideoCategoriesSub(id))
  return subCategoriesTemp.get(id)!
})

const selectTabId = shallowRef(id)
const subCategoriesStreamTemp = temp.$applyRaw(`subCategoriesStreamTemp`, () => new Map<string, RStream<cosav.video.CommonVideo>>())
const subSource = computed(() => {
  if (!subCategoriesStreamTemp.has(selectTabId.value))
    subCategoriesStreamTemp.set(selectTabId.value, cosav.api.search.utils.createCategoryStream(selectTabId.value))
  return subCategoriesStreamTemp.get(selectTabId.value)!
})
</script>

<template>
  <Content :source="subCategories" class="h-[calc(100%-var(--van-tabbar-height)-var(--van-tabs-padding-bottom))]">
    <Var :value="[{ name: '全部', id: id }, ...subCategories.data.value?.map(v => ({ name: v.name, id: v.CHID })) ?? []]"
      v-slot="{ value }">
      <VanTabs v-model:active="selectTabId" class="size-full *:last:size-full">
        <VanTab v-for="sub of value" :title="sub.name" :name="sub.id" class="size-full">
          <Waterfall :source="subSource" class="size-full" v-slot="{ item, index }">
            <VideoCard type="small" :height="false" :key="`${index}|${item.id}`" :video="item" />
          </Waterfall>
        </VanTab>
      </VanTabs>
    </Var>
  </Content>
</template>