<script setup lang='ts'>
import { uni } from '@/api/union'
import { isEmpty } from 'lodash-es'
import { shallowRef, computed, useTemplateRef } from 'vue'
import { useRoute } from 'vue-router'
import noneSearchTextIcon from '@/assets/images/none-search-text-icon.webp'
import Bika from './bika.vue'
import Jm from './jm.vue'


const showSearch = shallowRef(true)
const $route = useRoute()
const searchText = computed(() => decodeURIComponent($route.query.keyword as string ?? ''))
const searchMode = computed(() => ($route.query.mode as uni.SearchMode) ?? 'keyword')
const searchCom = useTemplateRef('searchCom')
</script>

<template>
  <header class="w-full h-[54px] text-(--van-text-color) duration-200 transition-transform"
    :class="[showSearch ? '!translate-y-0' : '!-translate-y-[54px]']">
    <Search ref="searchCom" :base-text="searchText" :base-mode="searchMode" show-action />
  </header>
  <NResult status="info" title="无搜索" class="h-[80vh] flex items-center flex-col justify-center" description="请输入"
    v-if="isEmpty(searchText)">
    <template #icon>
      <Image :src="noneSearchTextIcon" />
    </template>
  </NResult>
  <VanTabs class="duration-200 will-change-[transform,_height] transition-all" v-else animated
    :class="[showSearch ? 'h-[calc(100vh-54px)] translate-y-0' : 'h-[calc(100vh-32px)] -translate-y-[54px]']">
    <VanTab name="bika" title="bika">
      <Bika v-model:show-header="showSearch" :ins="searchCom" />
    </VanTab>
    <VanTab name="jm" title="jm">
      <Jm v-model:show-header="showSearch" />
    </VanTab>
  </VanTabs>
</template>