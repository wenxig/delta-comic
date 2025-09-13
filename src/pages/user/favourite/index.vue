<script setup lang='ts'>
import { CloudSyncOutlined } from '@vicons/antd'
import Layout from '../layout.vue'
import { useTemp } from '@/stores/temp'
import { CalendarViewDayRound, PlusRound, SearchFilled } from '@vicons/material'
import { computed, shallowRef, useTemplateRef } from 'vue'
import { FavouriteItem, useFavouriteStore } from '@/db/favourite'
import { PromiseContent } from '@/utils/data'
import { useConfig } from '@/config'
import { isEmpty, flatten, isNumber } from 'lodash-es'
import FavouriteCard from './favouriteCard.vue'
import { jm } from '@/api/jm'
import { bika } from '@/api/bika'
import { uni } from '@/api/union'
import { createLoadingMessage } from '@/utils/message'
import CreateFavouriteCard from '@/components/user/createFavouriteCard.vue'
import { motion } from 'motion-v'
import { useZIndex } from '@/utils/layout'
const isCardMode = shallowRef(true)

const temp = useTemp().$apply('favourite', () => ({
  selectMode: 'pack'
}))

const favouriteStore = useFavouriteStore()

const config = useConfig()
const isSearching = shallowRef(false)
const searchText = shallowRef('')
const [zIndex] = useZIndex(isSearching)

const allFavouriteCards = computed(() => [...favouriteStore.favouriteCards.values()])
const favouriteByFilter = computed<FavouriteItem[]>(() => {
  let val = allFavouriteCards.value.toReversed()
  if (!isEmpty(searchText.value)) val = val.filter(v => v.title.includes(searchText.value))
  return val
})


const isSyncing = shallowRef(false)
const syncFromCloud = PromiseContent.fromAsyncFunction(async () => {
  if (isSyncing.value) return
  isSyncing.value = true
  const loading = createLoadingMessage()
  try {
    const jmFav = jm.api.user.createFavouriteStream().nextToDone()
    const bikaFav = bika.api.user.createFavouriteComicStream().nextToDone()
    const items = await Promise.all([jmFav, bikaFav])
    await Promise.all(flatten(<{ toUniComic(): uni.comic.Comic }[][]>items).map(v => v.toUniComic()).map(item => favouriteStore.$updateItem(item, favouriteStore.defaultPack.key)))
    loading.success()
  } catch {
    loading.fail()
  }
  isSyncing.value = false
})

const createFavouriteCard = useTemplateRef('createFavouriteCard')
const waterfall = useTemplateRef('waterfall')
</script>

<template>
  <Layout title="我的收藏" :isLoading="isSyncing">
    <template #rightNav>
      <NIcon size="calc(var(--spacing) * 6.5)" color="var(--van-text-color-2)" @click="syncFromCloud">
        <CloudSyncOutlined />
      </NIcon>
    </template>
    <template #topNav>
      <div :class="[isSearching ? 'rounded-lg w-[calc(100%-8px)] right-1 ' : isEmpty(searchText)
        ? 'rounded-full w-1/2 right-[41px] !opacity-0 pointer-events-none' : 'rounded-full w-1/2 ml-3 right-[41px]']"
        class="transition-all duration-200 border-solid border bg-(--van-background-2) opacity-100 absolute !z-1000 border-gray-400 text-gray-400 h-[36px] px-1 flex items-center">
        <VanIcon name="search" color="rgb(156 163 175)" size="1.5rem" />
        <SearchTag :text="searchText" />
        <form action="/" @submit.prevent class="h-full w-full">
          <input type="search" class="h-full w-full border-none bg-transparent !font-normal"
            :class="[config['app.darkMode'] ? '!text-white' : '!text-black']" spellcheck="false"
            @focus="isSearching = true" v-model="searchText" ref="inputEl"
            @blur="isEmpty(searchText) || favouriteStore.mainFilters.unshift(searchText)" />
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
        <NIcon color="var(--van-text-color-2)" size="1.5rem" class="van-haptics-feedback" @click="isSearching = true">
          <SearchFilled />
        </NIcon>
        <NIcon color="var(--van-text-color-2)" size="1.5rem" class="van-haptics-feedback"
          @click="createFavouriteCard?.create()">
          <PlusRound />
        </NIcon>
        <NIcon color="var(--van-text-color-2)" size="1.5rem" class="van-haptics-feedback" @click="async () => {
          isCardMode = !isCardMode
          await waterfall?.reloadList()
        }">
          <CalendarViewDayRound v-if="isCardMode" />
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
    <Waterfall class="!h-full" unReloadable ref="waterfall"
      :source="{ data: PromiseContent.resolve(favouriteByFilter).useProcessor(v => [favouriteStore.defaultPack,...v.filter(v => v.key != favouriteStore.defaultPack.key), 1]), isEnd: true }"
      :data-processor="v => isSearching ? v.filter(v => isNumber(v) || v.title.includes(searchText)) : v"
      v-slot="{ item }" :col="1" :gap="6" :padding="6">
      <FavouriteCard :height="130" :item :isCardMode v-if="!isNumber(item)" />
      <div v-else class="flex justify-center items-center py-10">
        <NButton round type="tertiary" class="!px-3 !text-xs " size="small" @click="createFavouriteCard?.create()">
          新建收藏夹
          <template #icon>
            <NIcon>
              <PlusRound />
            </NIcon>
          </template>
        </NButton>
      </div>
    </Waterfall>
  </Layout>
  <CreateFavouriteCard ref="createFavouriteCard" />

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
          <template v-if="!isEmpty(favouriteStore.mainFilters)">
            <VanCell v-for="filter of favouriteStore.mainFilters" :title="filter" @click="searchText = filter"
              class="van-haptics-feedback w-full" />
          </template>
        </VanList>
      </motion.div>
    </AnimatePresence>
  </Teleport>
</template>