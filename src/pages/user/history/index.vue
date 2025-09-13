<script setup lang='ts'>
import { useTemp } from '@/stores/temp'
import Layout from '../layout.vue'
import { MoreHorizRound, SearchFilled } from '@vicons/material'
import { HistoryItem, useHistoryStore } from '@/db/history'
import { computed, shallowReactive, shallowRef } from 'vue'
import HistoryCard from './historyCard.vue'
import { isEmpty, sortBy } from 'lodash-es'
import { useConfig } from '@/config'
import { motion } from 'motion-v'
import { useZIndex } from '@/utils/layout'
import { PromiseContent } from '@/utils/data'
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
  if (!isEmpty(searchText.value)) val = val.filter(v => v.value.title.includes(searchText.value))
  return {
    all: val,
    comic: val.filter(v => v.value.type == 'comic'),
    video: val.filter(v => v.value.type == 'video'),
    blog: [],
    book: []
  }
})

const config = useConfig()
const isSearching = shallowRef(false)
const searchText = shallowRef('')
const [zIndex] = useZIndex(isSearching)

const showConfig = shallowRef(false)

const showRemove = shallowRef(false)
const removeList = shallowReactive(new Set<string>())
const isRemoving = shallowRef(false)
const removeItems = async (item?: HistoryItem) => {
  isRemoving.value = true
  showRemove.value = false
  if (item) {
    await historyStore.$remove(item.value)
  } else {
    await Promise.all([...removeList].map(key => historyStore.$remove(historyStore.history.get(key)!.value)))
  }
  cancel()
}
const cancel = () => {
  searchText.value = ''
  showRemove.value = false
  removeList.clear()
}
const selectAll = () => {
  removeList.clear()
  for (const [key] of historyStore.history) removeList.add(key)
}
</script>

<template>
  <Layout title="历史记录">
    <template #rightNav>
      <NIcon size="calc(var(--spacing) * 6.5)" class="van-haptics-feedback" @click="isSearching = true"
        color="var(--van-text-color-2)">
        <SearchFilled />
      </NIcon>
      <NIcon size="calc(var(--spacing) * 6.5)" class="rotate-90 van-haptics-feedback" @click="showConfig = true"
        color="var(--van-text-color-2)">
        <MoreHorizRound />
      </NIcon>
    </template>
    <template #topNav>
      <AnimatePresence>
        <motion.div v-if="showRemove"
          class="shadow-lg w-[95%] overflow-hidden fixed font-normal text-normal flex items-center z-2 top-safe-offset-12 left-1/2 -translate-x-1/2 bg-(--van-background-2) rounded-lg h-12"
          :initial="{ translateY: '-100%', opacity: 0 }" :animate="{ translateY: '0%', opacity: 1 }"
          :exit="{ translateY: '-100%', opacity: 0 }">
          <div class="ml-2 w-full flex items-center">
            <span class="bg-(--van-gray-1) px-1.5 text-[16px] rounded">
              已选<span class="text-(--nui-primary-color) px-0.5">{{ removeList.size }}</span>项
            </span>
          </div>
          <div class="flex text-nowrap items-center">
            <NButton class="!h-11" quaternary @click="selectAll()">全选</NButton>
            <VanButton square type="primary" @click="cancel()">取消</VanButton>
            <NPopconfirm @positive-click="removeItems()">
              <template #trigger>
                <VanButton square type="danger">删除</VanButton>
              </template>
              删除后内容不可恢复
            </NPopconfirm>
          </div>
        </motion.div>
        <div :class="[isSearching ? 'rounded-lg w-[calc(100%-8px)] right-1 ' : isEmpty(searchText)
          ? 'rounded-full w-1/2 right-[41px] !opacity-0 pointer-events-none' : 'rounded-full w-1/2 ml-3 right-[41px]']"
          class="transition-all duration-200 border-solid border bg-(--van-background-2) opacity-100 absolute !z-1000 border-gray-400 text-gray-400 h-[36px] px-1 flex items-center">
          <VanIcon name="search" color="rgb(156 163 175)" size="1.5rem" />
          <form action="/" @submit.prevent class="h-full w-full">
            <input type="search" class="h-full w-full border-none bg-transparent !font-normal"
              :class="[config['app.darkMode'] ? '!text-white' : '!text-black']" spellcheck="false"
              @focus="isSearching = true" v-model="searchText" ref="inputEl"
              @blur="isEmpty(searchText) || historyStore.filters.unshift(searchText)" />
            <Motion :initial="{ opacity: 0 }" :animate="{ opacity: !isEmpty(searchText) ? 1 : 0 }"
              :transition="{ type: 'tween', duration: 0.1 }">
              <VanIcon name="cross" @click="() => { searchText = ''; isSearching = false }"
                class="z-10 !absolute h-full right-2 !flex items-center top-0 font-bold transition-[transform,_opacity]"
                color="#9ca3af" />
            </Motion>
          </form>
        </div>
      </AnimatePresence>
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
        <NIcon size="1.5rem" class="van-haptics-feedback" @click="showRemove = true">
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
    <Waterfall class="!h-full" :source="{ data: PromiseContent.resolve(historiesByType[temp.selectMode]), isEnd: true }"
      v-slot="{ item }" :col="1" :gap="0" :padding="0" :minHeight="0">
      <VanSwipeCell class="w-full relative">
        <HistoryCard :height="130" :item />
        <Var :value="historyStore.createKey(item.value)" v-slot="{ value: key }">
          <AnimatePresence>
            <motion.div @click="showRemove && (removeList.has(key) ? removeList.delete(key) : removeList.add(key))"
              v-if="isRemoving || showRemove" class="w-full h-full absolute top-0 left-0" :initial="{ opacity: 0 }"
              :animate="{ opacity: 1 }" :exit="{ opacity: 0 }">
              <div class="flex justify-center items-center absolute top-0 right-0 h-full w-15">
                <motion.div v-if="showRemove && removeList.has(key)" :initial="{ opacity: 0 }" :animate="{ opacity: 1 }"
                  :exit="{ opacity: 0 }"
                  class="absolute top-0 right-0 h-full w-15 bg-[linear-gradient(to_left,_var(--nui-primary-color),_transparent)]">
                </motion.div>
                <Motion :initial="{ translateX: '100%' }" :animate="{ translateX: '0%' }" :exit="{ translateX: '100%' }"
                  v-if="showRemove">
                  <VanCheckbox :model-value="removeList.has(key)" class="bg-(--van-background-2) z-1 rounded-full" />
                </Motion>
              </div>
            </motion.div>
          </AnimatePresence>
        </Var>
        <template #right>
          <VanButton square text="删除" type="danger" class="!h-full" @click="removeItems(item)" />
        </template>
      </VanSwipeCell>
    </Waterfall>
  </Layout>

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

  <Teleport to="#popups">
    <AnimatePresence>
      <motion.div @click="isSearching = false" v-if="isSearching" :style="{ zIndex }" :initial="{ opacity: 0 }"
        :animate="{ opacity: 0.5 }"
        class="bg-(--van-black) w-screen h-screen fixed top-[calc(var(--van-tabs-line-height)+var(--van-tabs-padding-bottom)+var(--safe-area-inset-top))] left-0">
      </motion.div>
      <motion.div :style="{ zIndex }" :initial="{ height: 0, opacity: 0.3 }" :animate="{ height: 'auto', opacity: 1 }"
        :exit="{ height: 0, opacity: 0.3 }" v-if="isSearching" layout :transition="{ duration: 0.1 }"
        class="w-full flex flex-wrap max-h-[60vh] justify-evenly transition-all overflow-hidden bg-(--van-background-2) rounded-b-3xl pb-3 pt-1 fixed top-[calc(var(--van-tabs-line-height)+var(--van-tabs-padding-bottom)+var(--safe-area-inset-top))]">
        <VanList class="w-full">
          <template v-if="!isEmpty(historyStore.filters)">
            <VanCell v-for="filter of historyStore.filters" :title="filter" @click="searchText = filter"
              class="van-haptics-feedback w-full" />
          </template>
        </VanList>
      </motion.div>
    </AnimatePresence>
  </Teleport>
</template>