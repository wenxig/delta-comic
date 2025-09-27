<script setup lang='ts'>
import { shallowRef, useTemplateRef, watch } from 'vue'
import SearchPop from './searchPop.vue'
import { useRouter } from 'vue-router'
import { useScrollParent } from '@vant/use'
import { useLockHtmlScroll } from 'naive-ui/es/_utils'
import { SearchInstance } from 'vant'
import SearchTag from './searchTag.vue'
import { Utils } from 'delta-comic-core'
const $props = defineProps<{
  defaultText?: string
  class?: any
}>()
const search = shallowRef<SearchInstance>()
const searchText = shallowRef('')
watch(() => $props.defaultText, defaultText => searchText.value = defaultText ?? '', { immediate: true })

const isShowSearchPop = shallowRef(false)
const formEl = useTemplateRef('formEl')
const scrollParent = useScrollParent(<any>formEl)
const showSearchPopup = () => {
  scrollParent.value?.scroll({ top: 0, behavior: 'instant' })
  isShowSearchPop.value = true
}

const $router = useRouter()

const handleSearch = async (value: string) => {
  // app.searchHistory.unshift(value)
  $router.force.push(`/search?keyword=${encodeURIComponent(value)}`)
  search.value?.blur()
  isShowSearchPop.value = false
}

useLockHtmlScroll(isShowSearchPop)

defineExpose({
  searchInstance: search
})
const [zIndex] = Utils.layout.useZIndex(isShowSearchPop)
</script>

<template>
  <form action="/" @submit.prevent ref="formEl" :style="{ zIndex }"
    :class="[{ 'fixed top-0 left-0 w-screen z-1000': isShowSearchPop }, $props.class]">
    <VanSearch ref="search" :show-action="!isShowSearchPop" v-model="searchText" placeholder="请输入搜索内容"
      @search="handleSearch(searchText)" @click-left-icon="handleSearch(searchText)" @focus="showSearchPopup"
      @cancel="$router.back()" autocomplete="off">
      <template #left-icon>
        <div class="inline-flex items-center justify-center h-full translate-y-[1]">
          <VanIcon name="search" size="1.2rem" />
          <SearchTag />
        </div>
      </template>
    </VanSearch>
  </form>
  <SearchPop v-model:show="isShowSearchPop" v-model="searchText" @search="handleSearch(searchText)" />

</template>
<style scoped lang='scss'>
.sub-icon::before {
  -webkit-text-stroke: 1px var(--p-color);
}

.icon::before {
  pointer-events: none;
}
</style>