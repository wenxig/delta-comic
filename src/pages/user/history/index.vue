<script setup lang='ts'>
import { useTemp } from '@/stores/temp'
import Layout from '../layout.vue'
import { MoreHorizRound, SearchFilled } from '@vicons/material'
import { HistoryItem, useHistoryStore } from '@/db/history'
import { computed, shallowRef, useTemplateRef } from 'vue'
import HistoryCard from './historyCard.vue'
import { isEmpty, sortBy } from 'lodash-es'
import { useConfig } from '@/config'
import { PromiseContent } from '@/utils/data'
import Searcher from '../searcher.vue'
import Action from '../action.vue'
import { useDialog } from 'naive-ui'
type Type = 'all' | 'comic' | 'video' | 'blog' | 'book'
const typeMap: {
  type: Type,
  name: string
}[] = [{
  type: 'all',
  name: '全部'
}, {
  type: 'comic',
  name: '漫画'
}, {
  type: 'video',
  name: '视频'
}, {
  type: 'blog',
  name: '文章'
}, {
  type: 'book',
  name: '书库'
}]

const temp = useTemp().$apply('history', () => ({
  selectMode: <Type>'all'
}))

const historyStore = useHistoryStore()

const historiesByType = computed<Record<Type, HistoryItem[]>>(() => {
  let val = sortBy([...historyStore.history.values()], v => v.timestamp).toReversed()
  if (!isEmpty(searcher.value?.searchText)) val = val.filter(v => v.value.title.includes(searcher.value?.searchText ?? ''))
  return {
    all: val,
    comic: val.filter(v => v.value.type == 'comic'),
    video: val.filter(v => v.value.type == 'video'),
    blog: [],
    book: []
  }
})

const config = useConfig()
const searcher = useTemplateRef('searcher')

const showConfig = shallowRef(false)

const actionController = useTemplateRef('actionController')
const removeItems = async (item: HistoryItem[]) => {
  actionController.value!.showSelect = false
  await Promise.all(item.map(key => historyStore.$remove(key.value)))
  actionController.value?.selectList.clear()
}
const $dialog = useDialog()
</script>

<template>
  <Action ref="actionController" :action="[{
    text: '删除', color: 'var(--van-danger-color)', onTrigger(sel) {
      $dialog.warning({
        title: '警告',
        content: `你确认删除${sel.length}项?`,
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: () => removeItems(sel)
      })
    },
  }]" :values="historiesByType[temp.selectMode]" v-slot="{ ActionBar, SelectPacker }">
    <Layout title="历史记录">
      <template #rightNav>
        <NIcon size="calc(var(--spacing) * 6.5)" class="van-haptics-feedback"
          @click="searcher && (searcher!.isSearching = true)" color="var(--van-text-color-2)">
          <SearchFilled />
        </NIcon>
        <NIcon size="calc(var(--spacing) * 6.5)" class="rotate-90 van-haptics-feedback" @click="showConfig = true"
          color="var(--van-text-color-2)">
          <MoreHorizRound />
        </NIcon>
      </template>
      <template #topNav>
        <component :is="ActionBar" />
        <Searcher ref="searcher" v-model:filters-history="historyStore.filters" />
      </template>
      <template #bottomNav>
        <div class="w-full bg-(--van-background-2) h-12 items-center flex justify-evenly pt-4 pb-2">
          <NButton v-for="item of typeMap" class="!text-[0.9rem]" size="small" :="item.type == temp.selectMode ? {
            strong: true,
            secondary: true,
            type: 'primary'
          } : { quaternary: true }" @click="temp.selectMode = item.type">
            {{ item.name }}
          </NButton>
          <NIcon size="1.5rem" class="van-haptics-feedback" @click="actionController!.showSelect = true">
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24">
              <g fill="none">
                <path
                  d="M6.78 4.78a.75.75 0 0 0-1.06-1.06L3.75 5.69l-.47-.47a.75.75 0 0 0-1.06 1.06l1 1a.75.75 0 0 0 1.06 0l2.5-2.5zm14.47 13.227H9.75l-.102.007a.75.75 0 0 0 .102 1.493h11.5l.102-.007a.75.75 0 0 0-.102-1.493zm0-6.507H9.75l-.102.007A.75.75 0 0 0 9.75 13h11.5l.102-.007a.75.75 0 0 0-.102-1.493zm0-6.5H9.75l-.102.007A.75.75 0 0 0 9.75 6.5h11.5l.102-.007A.75.75 0 0 0 21.25 5zM6.78 17.78a.75.75 0 1 0-1.06-1.06l-1.97 1.97l-.47-.47a.75.75 0 0 0-1.06 1.06l1 1a.75.75 0 0 0 1.06 0l2.5-2.5zm0-7.56a.75.75 0 0 1 0 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-1-1a.75.75 0 1 1 1.06-1.06l.47.47l1.97-1.97a.75.75 0 0 1 1.06 0z"
                  fill="currentColor"></path>
              </g>
            </svg>
          </NIcon>
        </div>
      </template>
      <Waterfall class="!h-full" un-reloadable
        :source="{ data: PromiseContent.resolve(historiesByType[temp.selectMode]), isEnd: true }" v-slot="{ item }"
        :col="1" :gap="0" :padding="0" :minHeight="0">
        <VanSwipeCell class="w-full relative">
          <component :is="SelectPacker" :it="item">
            <HistoryCard :height="130" :item />
          </component>
          <template #right>
            <VanButton square text="删除" type="danger" class="!h-full" @click="removeItems([item])" />
          </template>
        </VanSwipeCell>
      </Waterfall>
    </Layout>
  </Action>
  <Popup v-model:show="showConfig" position="bottom" round class="!bg-(--van-background)">
    <div class="m-(--van-cell-group-inset-padding) w-full !mb-2 mt-4 font-semibold">历史记录设置</div>
    <VanCellGroup inset class="!mb-6">
      <VanCell center title="追踪历史记录" label="记录并展示新的历史足迹"
        @click="config['app.recordHistory'] = !config['app.recordHistory']">
        <template #right-icon>
          <VanSwitch size="large" v-model="config['app.recordHistory']" />
        </template>
      </VanCell>
    </VanCellGroup>
  </Popup>
</template>