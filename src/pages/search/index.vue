<script setup lang='ts'>
import { uni } from '@/api/union'
import { isEmpty } from 'lodash-es'
import { shallowRef, computed, useTemplateRef } from 'vue'
import { useRoute } from 'vue-router'
import noneSearchTextIcon from '@/assets/images/none-search-text-icon.webp'
import Bika from './bika.vue'
import Jm from './jm.vue'
import BikaSorter from '@/components/search/bikaSorter.vue'
import JmSorter from '@/components/search/jmSorter.vue'
import { bikaSorterValue, jmSorterValue } from '@/utils/translator'
import { useConfig } from '@/config'
import { CloudServerOutlined } from '@vicons/antd'


const showSearch = shallowRef(true)
const $route = useRoute()
const searchText = computed(() => decodeURIComponent($route.query.keyword as string ?? ''))
const searchMode = computed(() => ($route.query.mode as uni.SearchMode) ?? 'keyword')
const searchCom = useTemplateRef('searchCom')

const sorter = useTemplateRef('sorter')
const toSearchInHideMode = async () => {
  showSearch.value = true
  searchCom.value?.searchInstance?.focus()
}
const config = useConfig()

const bikaSearch = useTemplateRef('bikaSearch')

const searchOrigin = shallowRef('bika')
</script>

<template>
  <header class="w-full h-[86px] text-(--van-text-color) duration-200 transition-transform"
    :class="[showSearch ? '!translate-y-0' : '!-translate-y-[54px]']">
    <Search ref="searchCom" :base-text="searchText" :base-mode="searchMode" show-action />
    <div class="van-hairline--bottom h-8 w-full relative bg-(--van-background-2)">
      <div class="w-full items-center flex *:!text-nowrap overflow-x-auto scroll gap-2 pr-2">
        <VanPopover :actions="[{ text: 'bika' }, { text: 'jm' }]" @select="q => searchOrigin = q.text"
          placement="bottom-start">
          <template #reference>
            <NButton quaternary class="!pr-0">
              搜索源:<span class="text-(--nui-primary-color) text-xs">{{ searchOrigin }}</span>
              <template #icon>
                <NIcon size="1.8rem">
                  <CloudServerOutlined />
                </NIcon>
              </template>
            </NButton>
          </template>
        </VanPopover>
        <div class="text-sm h-full van-haptics-feedback flex justify-start items-center"
          @click="bikaSearch?.setShowFiller(true)">
          <VanIcon :badge="config['bika.search.fillerTags'].filter(v => v.mode != 'auto').length || undefined"
            name="filter-o" size="1.5rem" />过滤
        </div>
        <div class="text-sm h-full van-haptics-feedback flex justify-start items-center" @click="sorter?.show()">
          <VanIcon name="sort" size="1.5rem" class="sort-icon" />排序
          <span class="text-(--nui-primary-color) text-xs" v-if="searchOrigin == 'bika'">-{{
            bikaSorterValue.find(v => v.value == config['bika.search.sort'])?.text
            }}
            <BikaSorter ref="sorter" />
          </span>
          <span class="text-(--nui-primary-color) text-xs" v-else-if="searchOrigin == 'jm'">-{{
            jmSorterValue.find(v => v.value == config['jm.search.sort'])?.text || '默认'
            }}
            <JmSorter ref="sorter" />
          </span>
        </div>
        <div class="text-sm h-full van-haptics-feedback flex justify-start items-center">
          <VanSwitch v-model="config['app.search.showAIProject']" size="1rem" />展示AI作品
        </div>
      </div>
      <VanIcon @click="toSearchInHideMode" :class="[showSearch ? 'translate-x-full' : '-translate-x-2']" size="25px"
        class="!absolute top-1/2 duration-200 transition-transform right-0 -translate-y-1/2 bg-(--van-background-2) shadow rounded-full p-1"
        name="search" color="var(--van-text-color-2)" />
    </div>
  </header>

  <NResult status="info" title="无搜索" class="h-[80vh] flex items-center flex-col justify-center" description="请输入"
    v-if="isEmpty(searchText)">
    <template #icon>
      <Image :src="noneSearchTextIcon" />
    </template>
  </NResult>
  <VanTabs class="duration-200 *:!h-full transition-all will-change-[height,_transform]" v-model:active="searchOrigin"
    :show-header="false" v-else animated
    :class="[showSearch ? 'h-[calc(100vh-54px)] translate-y-0' : 'h-[calc(100vh-32px)] -translate-y-[54px]']">
    <VanTab name="bika" title="bika">
      <Bika v-model:show-header="showSearch" ref="bikaSearch" />
    </VanTab>
    <VanTab name="jm" title="jm">
      <Jm v-model:show-header="showSearch" />
    </VanTab>
  </VanTabs>
</template>
<style scoped lang='scss'>
:deep(.van-swipe-item) {
  height: 100% !important;
}

:deep(.van-tab__panel) {
  height: 100% !important;
}

.scroll::-webkit-scrollbar {
  display: none;
}
</style>