<script setup lang='ts'>
import { fromPairs, isEmpty } from 'lodash-es'
import { shallowRef, computed, useTemplateRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import noneSearchTextIcon from '@/assets/images/none-search-text-icon.webp'
import { CloudServerOutlined } from '@vicons/antd'
import { Comp, PluginConfigSearchMethod, Store } from 'delta-comic-core'
import { usePluginStore } from '@/plugin/store'
import List from './list.vue'
import { SearchInstance } from 'vant'
const $route = useRoute()
const pluginStore = usePluginStore()
const config = Store.useConfig()
const inputSort = $route.query.sort?.toString()
const inputSource = $route.query.source?.toString()
const temp = Store.useTemp().$apply('searchBase', () => {
  const first = pluginStore.allSearchSource[0]
  return {
    source: `${first[0]}:${first[1][0][0]}`,
    sort: first[1][0][1].defaultSort
  }
})

const decodeURI = (url: string) => {
  let last = url
  do {
    url = window.decodeURI(url)
    if (last == url) break
    last = url
  } while (url.includes('%'))
  return url
}

if (inputSource) temp.source = inputSource
if (inputSort) if (inputSource) {
  const [plugin, name] = (temp.source).split(':')
  const s = fromPairs(fromPairs(pluginStore.allSearchSource)[plugin])[name]
  console.log(pluginStore.allSearchSource,(fromPairs(pluginStore.allSearchSource)[plugin]))
  temp.sort = s.defaultSort
}
const showSearch = shallowRef(true)
const searchText = shallowRef(decodeURI($route.params.input?.toString() ?? ''))

const method = computed(() => {
  const [plugin, name] = temp.source.split(':')
  return [plugin, fromPairs(fromPairs(pluginStore.allSearchSource)[plugin])[name]] as [plugin: string, method: PluginConfigSearchMethod]
})
const $router = useRouter()
const handleSearch = (text: string) => $router.force.push({
  name: 'search',
  params: {
    input: encodeURI(text)
  },
  query: {
    source: temp.source,
    sort: temp.sort
  }
})

const search = useTemplateRef<SearchInstance>('search')
const goSearch = () => {
  showSearch.value = true
  search.value?.focus()
}
</script>

<template>
  <div class="w-full pt-safe bg-(--van-background-2) fixed top-0 z-1"></div>
  <header class="w-full h-[86px] text-(--van-text-color) duration-200 transition-transform mt-safe"
    :class="[showSearch ? '!translate-y-0' : '!-translate-y-[54px]']">
    <form action="/" @submit.prevent :class="[{ 'fixed top-0 left-0 w-screen z-1000': false }]">
      <VanSearch ref="search" :show-action="true" v-model="searchText" placeholder="请输入搜索内容"
        @search="handleSearch(searchText)" @click-left-icon="handleSearch(searchText)" @cancel="$router.back()"
        autocomplete="off">
        <template #left-icon>
          <div class="inline-flex items-center justify-center h-full translate-y-[1]">
            <VanIcon name="search" size="1.2rem" />
          </div>
        </template>
      </VanSearch>
    </form>
    <div class="van-hairline--bottom h-8 w-full relative bg-(--van-background-2)">
      <div class="w-full items-center flex *:!text-nowrap overflow-x-auto scroll gap-2 pr-2">
        <NPopselect :options="pluginStore.allSearchSource.map(([plugin, sources]) => ({
          type: 'group',
          label: plugin,
          children: sources.map(([id, { name }]) => ({
            label: name,
            value: `${plugin}:${id}`
          }))
        }))" v-model:value="temp.source" placement="bottom" size="large">
          <NButton quaternary>
            搜索源:<span class="text-(--nui-primary-color) text-xs">
              {{ temp.source.split(':')[0] }}:{{ method[1].name }}
            </span>
            <template #icon>
              <NIcon size="1.8rem">
                <CloudServerOutlined />
              </NIcon>
            </template>
          </NButton>
        </NPopselect>
        <VanPopover :actions="method[1].sorts" @select="q => temp.sort = q.value" placement="bottom-start">
          <template #reference>
            <NButton quaternary class="text-sm h-full van-haptics-feedback flex justify-start items-center">
              <template #icon>
                <VanIcon name="sort" size="1.5rem" class="sort-icon" />
              </template>排序
              <span class="text-(--nui-primary-color) text-xs">
                -{{method[1].sorts.find(v => v.value == temp.sort)?.text ?? 'not found'}}
              </span>
            </NButton>
          </template>
        </VanPopover>
        <div class="text-sm h-full van-haptics-feedback flex justify-start items-center">
          <VanSwitch v-model="config.appConfig['core.showAIProject']" size="1rem" />展示AI作品
        </div>
      </div>
      <VanIcon @click="goSearch" :class="[showSearch ? 'translate-x-full' : '-translate-x-2']" size="25px"
        class="!absolute top-1/2 duration-200 transition-transform right-0 -translate-y-1/2 bg-(--van-background-2) shadow rounded-full p-1"
        name="search" color="var(--van-text-color-2)" />
    </div>
  </header>

  <NResult status="info" title="无搜索" class="h-[80vh] flex items-center flex-col justify-center" description="请输入"
    v-if="isEmpty(searchText)">
    <template #icon>
      <Comp.Image :src="noneSearchTextIcon" />
    </template>
  </NResult>
  <div class="duration-200 *:!h-full transition-all will-change-[height,_transform]" v-else
    :class="[showSearch ? 'h-[calc(100vh-var(--van-tabs-line-height)-var(--van-tabs-padding-bottom)-var(--safe-area-inset-top))] translate-y-0' : 'h-[calc(100vh-32px-var(--safe-area-inset-top))] -translate-y-[calc(var(--van-tabs-line-height)+var(--van-tabs-padding-bottom))]']">
    <List v-model:show-header="showSearch" :source="temp.source" :sort="temp.sort" :input="searchText" />
  </div>
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