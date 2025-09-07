<script setup lang='ts'>
import { CloudSyncOutlined } from '@vicons/antd'
import Layout from '../layout.vue'
import { useTemp } from '@/stores/temp'
import { CalendarViewDayOutlined, PlusRound, SearchFilled } from '@vicons/material'
import { computed, shallowRef } from 'vue'
import { FavouriteItem, useFavouriteStore } from '@/db/favourite'
import { PromiseContent } from '@/utils/data'
import { useConfig } from '@/config'
import { useZIndex } from '@/utils/layout'
import { sortBy, isEmpty, flatten } from 'lodash-es'
import { motion } from 'motion-v'
import { reactive } from 'vue'
import FavouriteCard from './favouriteCard.vue'
import { jm } from '@/api/jm'
import { bika } from '@/api/bika'
import { uni } from '@/api/union'
import { createLoadingMessage } from '@/utils/message'
const isCardMode = shallowRef(true)

const temp = useTemp().$apply('favourite', () => ({
  selectMode: 'pack'
}))

const favouriteStore = useFavouriteStore()

const config = useConfig()
const isSearching = shallowRef(false)
const searchText = shallowRef('')
const [zIndex] = useZIndex(isSearching)
const favouriteByFilter = computed<FavouriteItem[]>(() => {
  let val = [...favouriteStore.favourite.values()].toReversed()
  if (!isEmpty(searchText.value)) val = val.filter(v => v.title.includes(searchText.value))
  return val
})


const showRemove = shallowRef(false)
const removeList = reactive(new Set<string>())
const isRemoving = shallowRef(false)
const cancel = () => {
  searchText.value = ''
  showRemove.value = false
  removeList.clear()
}
const selectAll = () => {
  removeList.clear()
  for (const [key] of favouriteStore.favourite) removeList.add(key)
}

const isSyncing = shallowRef(false)
const syncFromCloud = PromiseContent.fromAsyncFunction(async () => {
  if (isSyncing.value) return
  isSyncing.value = true
  const loading = createLoadingMessage()
  try {
    const jmFav = jm.api.user.createFavouriteStream().nextToDone()
    const bikaFav = bika.api.user.createFavouriteComicStream().nextToDone()
    const items = await Promise.all([jmFav, bikaFav])
    await favouriteStore.$pushItem(favouriteStore.defaultPack, ...flatten(<{ toUniComic(): uni.comic.Comic }[][]>items).map(v => v.toUniComic()))
    loading.success()
  } catch {
    loading.fail()
  }
  isSyncing.value = false
})
</script>

<template>
  <Layout title="我的收藏" :isLoading="isSyncing">
    <template #rightNav>
      <NIcon size="calc(var(--spacing) * 6.5)" color="var(--van-text-color-2)" @click="syncFromCloud">
        <CloudSyncOutlined />
      </NIcon>
    </template>
    <template #topNav>
      <AnimatePresence>
        <motion.div v-if="showRemove"
          class="shadow-lg w-[95%] overflow-hidden fixed font-normal text-normal flex items-center z-2 top-safe-offset-12 left-1/2 -translate-x-1/2 bg-(--van-background-2) rounded-lg h-12"
          :initial="{ translateY: '-100%', opacity: 0 }" :animate="{ translateY: '0%', opacity: 1 }"
          :exit="{ translateY: '-100%', opacity: 0 }">
          <div class="ml-2 w-full flex items-center">
            <span class="bg-(--van-gray-2) px-1.5 text-[16px] rounded">
              已选<span class="text-(--nui-primary-color) px-0.5">{{ removeList.size }}</span>项
            </span>
          </div>
          <div class="flex text-nowrap items-center">
            <NButton class="!h-11" quaternary @click="selectAll()">全选</NButton>
            <VanButton square type="primary" @click="cancel()">取消</VanButton>
            <NPopconfirm @positive-click="favouriteStore.$removeCard(...removeList.values())">
              <template #trigger>
                <VanButton square type="danger">删除</VanButton>
              </template>
              删除后内容不可恢复
            </NPopconfirm>
          </div>
        </motion.div>
      </AnimatePresence>
      <div :class="[isSearching ? 'rounded-lg w-[calc(100%-8px)] right-1 ' : isEmpty(searchText)
        ? 'rounded-full w-1/2 right-[41px] !opacity-0 pointer-events-none' : 'rounded-full w-1/2 ml-3 right-[41px]']"
        class="transition-all duration-200 border-solid border bg-(--van-background-2) opacity-100 absolute !z-1000 border-gray-400 text-gray-400 h-[36px] px-1 flex items-center">
        <VanIcon name="search" color="rgb(156 163 175)" size="1.5rem" />
        <SearchTag :text="searchText" />
        <form action="/" @submit.prevent class="h-full w-full">
          <input type="search" class="h-full w-full border-none bg-transparent !font-normal"
            :class="[config['app.darkMode'] ? '!text-white' : '!text-black']" spellcheck="false"
            @focus="isSearching = true" v-model="searchText" ref="inputEl" />
          <Motion :initial="{ opacity: 0 }" :animate="{ opacity: !isEmpty(searchText) ? 1 : 0 }"
            :transition="{ type: 'tween', duration: 0.1 }">
            <VanIcon name="cross" @click="() => { searchText = ''; isSearching = false }"
              class="z-10 !absolute h-full right-2 !flex items-center top-0 font-bold transition-[transform,_opacity]"
              color="#9ca3af" />
          </Motion>
        </form>
      </div>
    </template>
    <template #bottomNav>
      <div class="w-full bg-(--van-background-2) h-12 items-center flex justify-evenly pt-4 pb-2 gap-4 pr-4">
        <div class="w-full pl-4">
          <NButton v-for="item of [{
            type: 'pack',
            name: '收藏夹'
          }]" class="!text-[0.9rem] " size="small" :="item.type == temp.selectMode ? {
          strong: true,
          secondary: true,
          type: 'primary'
        } : { quaternary: true }" @click="temp.selectMode = item.type">
            {{ item.name }}
          </NButton>
        </div>
        <NIcon size="1.5rem" class="van-haptics-feedback">
          <SearchFilled />
        </NIcon>
        <NIcon size="1.5rem" class="van-haptics-feedback">
          <PlusRound />
        </NIcon>
        <NIcon size="1.5rem" class="van-haptics-feedback">
          <CalendarViewDayOutlined v-if="isCardMode" />
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 20 20" v-else>
            <g fill="none">
              <path
                d="M3.5 4A1.5 1.5 0 0 0 2 5.5v2A1.5 1.5 0 0 0 3.5 9h2A1.5 1.5 0 0 0 7 7.5v-2A1.5 1.5 0 0 0 5.5 4h-2zM3 5.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2zM9.5 5a.5.5 0 0 0 0 1h8a.5.5 0 0 0 0-1h-8zm0 2a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1h-6zm-6 4A1.5 1.5 0 0 0 2 12.5v2A1.5 1.5 0 0 0 3.5 16h2A1.5 1.5 0 0 0 7 14.5v-2A1.5 1.5 0 0 0 5.5 11h-2zM3 12.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2zm6.5-.5a.5.5 0 0 0 0 1h8a.5.5 0 0 0 0-1h-8zm0 2a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1h-6z"
                fill="currentColor"></path>
            </g>
          </svg>
        </NIcon>
      </div>
    </template>
    <Waterfall class="!h-full" :source="{ data: PromiseContent.resolve(favouriteByFilter), isEnd: true }"
      v-slot="{ item }" :col="1" :gap="6" :padding="6">
      <VanSwipeCell class="w-full relative">
        <FavouriteCard :height="130" :item :isCardMode />
        <Var :value="item.key" v-slot="{ value: key }">
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
          <VanButton square text="删除" type="danger" class="!h-full" @click="favouriteStore.$removeCard(item.key)" />
        </template>
      </VanSwipeCell>
    </Waterfall>
  </Layout>

</template>