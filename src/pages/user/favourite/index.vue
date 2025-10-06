<script setup lang='ts'>
import { CloudSyncOutlined } from '@vicons/antd'
import Layout from '../layout.vue'
import { CalendarViewDayRound, PlusRound, SearchFilled } from '@vicons/material'
import { shallowRef, useTemplateRef } from 'vue'
import { isNumber } from 'lodash-es'
import FavouriteCard from './favouriteCard.vue'
import Searcher from '../searcher.vue'
import { Db, Store, Utils, Comp } from 'delta-comic-core'
const isCardMode = shallowRef(true)

const temp = Store.useTemp().$apply('favourite', () => ({
  selectMode: 'pack'
}))

const allFavouriteCards = Utils.db.useLiveQueryRef(() => Db.favouriteDB.favouriteCardBase.toArray(), [])
const searcher = useTemplateRef('searcher')

const isSyncing = shallowRef(false)
const syncFromCloud = Utils.data.PromiseContent.fromAsyncFunction(async () => {
  if (isSyncing.value) return
  isSyncing.value = true
  const loading = Utils.message.createLoadingMessage()
  try {
    await Db.favouriteDB.$setCards({
      title: '同步文件夹',
      description: '',
      createAt: 1,
      private: true
    })
    await Db.favouriteDB.$clearCards(1)

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
      <Searcher ref="searcher" v-model:filtersHistory="Db.favouriteDB.mainFilters.value" />
    </template>
    <template #bottomNav>
      <div class="w-full bg-(--van-background-2) h-12 items-center flex justify-evenly pt-4 pb-2 gap-4 pr-4">
        <div class="w-full pl-4">
          <NButton v-for="item of [{
            type: 'pack',
            name: '收藏夹'
          }]" class="!text-[0.9rem] " size="small" :="item.type === temp.selectMode ? {
            strong: true,
            secondary: true,
            type: 'primary'
          } : { quaternary: true }" @click="temp.selectMode = item.type">
            {{ item.name }}
          </NButton>
        </div>
        <NIcon color="var(--van-text-color-2)" size="1.5rem" class="van-haptics-feedback"
          @click="searcher && (searcher!.isSearching = true)">
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
    <Comp.Waterfall class="!h-full" unReloadable ref="waterfall"
      :source="{ data: Utils.data.PromiseContent.resolve((<Db.FavouriteCard[]><any>allFavouriteCards).toReversed()), isEnd: true }"
      :data-processor="v => v.filter(v => isNumber(v) || v.title.includes(searcher?.searchText ?? ''))"
      v-slot="{ item }" :col="1" :gap="6" :padding="6">
      <div class="flex justify-center items-center py-10" v-if="isNumber(item)">
        <NButton round type="tertiary" class="!px-3 !text-xs " size="small" @click="createFavouriteCard?.create()">
          新建收藏夹
          <template #icon>
            <NIcon>
              <PlusRound />
            </NIcon>
          </template>
        </NButton>
      </div>
      <FavouriteCard :height="130" :card="item" :isCardMode v-else />

    </Comp.Waterfall>
  </Layout>
  <Comp.user.CreateFavouriteCard ref="createFavouriteCard" />

</template>