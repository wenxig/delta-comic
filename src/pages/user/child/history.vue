<script setup lang='ts'>
import { useTemp } from '@/stores/temp'
import Layout from './layout.vue'
import { MoreHorizRound, SearchFilled } from '@vicons/material'
import { HistoryItem, useHistoryStore } from '@/db/history'
import { computed } from 'vue'
import HistoryCard from './historyCard.vue'
import { sortBy } from 'lodash-es'
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
  const val = sortBy([...historyStore.history.values()], v => v.timestamp)
  return {
    all: val,
    comic: val.filter(v => v.value.type == 'comic'),
    video: val.filter(v => v.value.type == 'video'),
    blog: [],
    book: []
  }
})
</script>

<template>
  <Layout title="历史记录">
    <template #rightNav>
      <NIcon size="calc(var(--spacing) * 6.5)" class="!absolute right-13 van-haptics-feedback" @click="$router.back()"
        color="var(--van-text-color-2)">
        <SearchFilled />
      </NIcon>
      <NIcon size="calc(var(--spacing) * 6.5)" class="!absolute rotate-90 right-2 van-haptics-feedback"
        @click="$router.back()" color="var(--van-text-color-2)">
        <MoreHorizRound />
      </NIcon>
      <form action="/" @submit.prevent class="h-full w-full">
        <input type="search" class="h-full w-full border-none bg-transparent input"
          :class="[config['app.darkMode'] ? '!text-white' : '!text-black']" spellcheck="false"
          @focus="isSearching = true" v-model="searchText" :placeholder="hotTag.state.value?.toString()"
          ref="inputEl" />
        <Transition leave-from-class="translate-x-[0%] opacity-100" leave-active-class="translate-x-[30%] opacity-0"
          leave-to-class="translate-x-[30%] opacity-0" enter-from-class="translate-x-[30%] opacity-0"
          enter-active-class="translate-x-[0%] opacity-100" enter-to-class="translate-x-[0%] opacity-100">
          <VanIcon name="cross"
            class="z-10 absolute h-full right-2 flex items-center top-0 font-bold transition-[transform,_opacity]"
            color="#9ca3af" v-if="!isEmpty(searchText)"></VanIcon>
          <div v-else></div>
        </Transition>
      </form>
    </template>
    <template #topNav>
      <div class="w-full bg-(--van-background-2) h-12 items-center flex justify-evenly pt-4 pb-2">
        <NButton v-for="item of typeMap" class="!text-[0.9rem]" size="small" :="item.type == temp.selectMode ? {
          strong: true,
          secondary: true,
          type: 'primary'
        } : { quaternary: true }" @click="temp.selectMode = item.type">
          {{ item.name }}
        </NButton>
        <NIcon size="1.5rem">
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
    <List class="!h-full" :item-height="130" :source="historiesByType[temp.selectMode]"
      v-slot="{ data: { item }, height }">
      <HistoryCard :height :item />
    </List>
  </Layout>

</template>