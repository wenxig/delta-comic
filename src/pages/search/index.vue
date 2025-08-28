<script setup lang='ts'>
import { uni } from '@/api/union'
import { isEmpty } from 'lodash-es'
import { shallowRef, computed, useTemplateRef } from 'vue'
import { useRoute } from 'vue-router'
import noneSearchTextIcon from '@/assets/images/none-search-text-icon.webp'
import BikaSorter from '@/components/search/bikaSorter.vue'
import JmSorter from '@/components/search/jmSorter.vue'
import { bikaSorterValue, cosavSorterValue, jmSorterValue } from '@/utils/translator'
import { useConfig } from '@/config'
import { CloudServerOutlined } from '@vicons/antd'
import { useTemp } from '@/stores/temp'
import Cosav from './cosav.vue'
import Bika from './bika.vue'
import Jm from './jm.vue'
const $route = useRoute()

const searchBaseTemp = useTemp().$apply('searchBase', () => ({ origin: <uni.SearchSource>'bika' }))

const showSearch = shallowRef(true)
const searchText = computed(() => decodeURIComponent($route.query.keyword as string ?? ''))
const searchMode = computed(() => ($route.query.mode as uni.SearchMode) ?? 'keyword')
const searchCom = useTemplateRef('searchCom')

const sorter = useTemplateRef('sorter')
const toSearchInHideMode = async () => {
  showSearch.value = true
  searchCom.value?.searchInstance?.focus()
}
const config = useConfig()

</script>

<template>
  <div class="w-full h-(--safe-area-inset-top) bg-(--van-background-2)"></div>
  <header class="w-full h-[86px] text-(--van-text-color) duration-200 transition-transform"
    :class="[showSearch ? '!translate-y-0' : '!-translate-y-[54px]']">
    <Search :source="searchBaseTemp.origin" ref="searchCom" :base-text="searchText" :base-mode="searchMode"
      show-action />
    <div class="van-hairline--bottom h-8 w-full relative bg-(--van-background-2)">
      <div class="w-full items-center flex *:!text-nowrap overflow-x-auto scroll gap-2 pr-2">
        <VanPopover :actions="[{ text: 'bika' }, { text: 'jm' }, { text: 'cosav' }]"
          @select="q => searchBaseTemp.origin = q.text" placement="bottom-start">
          <template #reference>
            <NButton quaternary class="!pr-0">
              搜索源:<span class="text-(--nui-primary-color) text-xs">{{ searchBaseTemp.origin }}</span>
              <template #icon>
                <NIcon size="1.8rem">
                  <CloudServerOutlined />
                </NIcon>
              </template>
            </NButton>
          </template>
        </VanPopover>
        <div class="text-sm h-full van-haptics-feedback flex justify-start items-center" @click="sorter?.show()">
          <VanIcon name="sort" size="1.5rem" class="sort-icon" />排序
          <span class="text-(--nui-primary-color) text-xs" v-if="searchBaseTemp.origin == 'bika'">-{{
            bikaSorterValue.find(v => v.value == config['bika.search.sort'])?.text
          }}
            <BikaSorter ref="sorter" />
          </span>
          <span class="text-(--nui-primary-color) text-xs" v-else-if="searchBaseTemp.origin == 'jm'">-{{
            jmSorterValue.find(v => v.value == config['jm.search.sort'])?.text
          }}
            <JmSorter ref="sorter" />
          </span>
          <span class="text-(--nui-primary-color) text-xs" v-else-if="searchBaseTemp.origin == 'cosav'">-{{
            cosavSorterValue.find(v => v.value == config['cosav.search.sort'])?.text
          }}
            <CosavSorter ref="sorter" />
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
  <VanTabs class="duration-200 *:!h-full transition-all will-change-[height,_transform]"
    v-model:active="searchBaseTemp.origin" :show-header="false" v-else animated
    :class="[showSearch ? 'h-[calc(100vh-var(--van-tabs-line-height)-var(--van-tabs-padding-bottom)-var(--safe-area-inset-top))] translate-y-0' : 'h-[calc(100vh-32px-var(--safe-area-inset-top))] -translate-y-[calc(var(--van-tabs-line-height)+var(--van-tabs-padding-bottom))]']">
    <VanTab name="bika" title="bika">
      <Bika v-model:show-header="showSearch" />
    </VanTab>
    <VanTab name="jm" title="jm">
      <Jm v-model:show-header="showSearch" />
    </VanTab>
    <VanTab name="cosav" title="cosav">
      <Cosav v-model:show-header="showSearch" />
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