<script setup lang='ts'>
import { shallowRef, useTemplateRef } from 'vue'
import SearchPop from './searchPop.vue'
import { useRouter } from 'vue-router'
import { useScrollParent } from '@vant/use'
import { useLockHtmlScroll } from 'naive-ui/es/_utils'
import { SearchInstance } from 'vant'
import { searchModeMap, useSearchMode } from '@/utils/translator'
import { useZIndex } from '@/utils/layout'
import SearchTag from './searchTag.vue'
import { uni } from '@/api/union'
const $props = defineProps<{
  baseText?: string
  baseMode?: uni.SearchMode
  showAction?: boolean
  class?: any
}>()
const search = shallowRef<SearchInstance>()
const searchText = shallowRef(($props.baseMode && $props.baseText) ? `${searchModeMap[$props.baseMode]}${$props.baseText}` : '')
const isShowSearchPop = shallowRef(false)
const f = useTemplateRef('f')
const scrollParent = useScrollParent(<any>f)
const showHotTags = () => {
  scrollParent.value?.scroll({ top: 0, behavior: 'instant' })
  isShowSearchPop.value = true
}
const searchMode = useSearchMode(searchText)
const urlText = (str: string) => str.replace(/^[\@\#]+/g, '')
const router = useRouter()
const handleSearch = (value: string) => {
  // app.searchHistory.unshift(value)
  router.force.push(`/search?keyword=${encodeURIComponent(urlText(value))}&mode=${searchMode.value}`)
  search.value?.blur()
  isShowSearchPop.value = false
}

useLockHtmlScroll(isShowSearchPop)

defineExpose({
  searchInstance: search
})
const [zIndex] = useZIndex(isShowSearchPop)
</script>

<template>
  <form action="/" @submit.prevent ref="f" :style="{ zIndex }"
    :class="[{ 'fixed top-0 left-0 w-screen z-1000': isShowSearchPop }, $props.class]">
    <VanSearch ref="search" :show-action="showAction && !isShowSearchPop" v-model="searchText" placeholder="请输入搜索内容"
      @search="handleSearch(searchText)" @click-left-icon="handleSearch(searchText)" @focus="showHotTags"
      @cancel="$router.back()" autocomplete="off">
      <template #left-icon>
        <div class="inline-flex items-center justify-center h-full translate-y-[1]">
          <VanIcon name="search" size="1.2rem" />
          <SearchTag :text="searchText" />
        </div>
      </template>
    </VanSearch>
  </form>
  <SearchPop v-model:show="isShowSearchPop" v-model="searchText" @search="handleSearch(searchText)" :zIndex />

</template>
<style scoped lang='scss'>
.sub-icon::before {
  -webkit-text-stroke: 1px var(--p-color);
}

.icon::before {
  pointer-events: none;
}
</style>