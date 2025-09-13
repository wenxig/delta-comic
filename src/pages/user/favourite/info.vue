<script setup lang='ts'>
import { useRoute } from 'vue-router'
import Layout from '../layout.vue'
import { MoreHorizRound, SearchFilled } from '@vicons/material'
import { FavouriteValue, useFavouriteStore } from '@/db/favourite'
import { computed, shallowRef } from 'vue'
import { isEmpty, sortBy } from 'lodash-es'
import FavouriteItem from './favouriteItem.vue'
import { PromiseContent } from '@/utils/data'
import { motion } from 'motion-v'
import { shallowReactive } from 'vue'
import { useConfig } from '@/config'
import { useDialog } from 'naive-ui'
import { createLoadingMessage } from '@/utils/message'
import FavouriteSelect2 from './favouriteSelect.vue'
import { useTemplateRef } from 'vue'
import { useZIndex } from '@/utils/layout'
const $route = useRoute()
const cardKey = $route.params.id.toString()
const favouriteStore = useFavouriteStore()
const card = computed(() => favouriteStore.favouriteCards.get(cardKey)!)
const items = computed(() => sortBy([...favouriteStore.favouriteItem.values()].filter(v => v.belongTo.includes(cardKey)), v => v.addtime).toReversed())

const showSelect = shallowRef(false)
const selectList = shallowReactive(new Set<FavouriteValue>())
const cancel = () => {
  showSelect.value = false
  selectList.clear()
}
const selectAll = () => {
  selectList.clear()
  for (const item of items.value) selectList.add(item)
}
const $dialog = useDialog()
const doAction = async (mode: 'moveTo' | 'copyTo' | 'remove') => {
  switch (mode) {
    case 'remove':
      $dialog.warning({
        title: '警告',
        content: `你确认删除${selectList.size}项?`,
        positiveText: '确定',
        negativeText: '取消',
        draggable: true,
        onPositiveClick: async () => {
          await createLoadingMessage('删除中').bind(Promise.all(
            [...selectList.values()].map(item => favouriteStore.$updateItem(item, ...item.belongTo.filter(aim => aim != cardKey)))
          ))
          cancel()
        }
      })
      break
    case 'moveTo':
      try {
        if (!selCard.value) return
        const selectCardKeys = await selCard.value.create()
        await createLoadingMessage('移动中').bind(Promise.all([...selectList.values()].map(item =>
          favouriteStore.$updateItem(item, ...selectCardKeys, ...item.belongTo.filter(aim => aim != cardKey))
        )))
      } catch { }
      cancel()
      break
    case 'copyTo':
      try {
        if (!selCard.value) return
        const selectCardKeys = await selCard.value.create()
        await createLoadingMessage('复制中').bind(Promise.all([...selectList.values()].map(item =>
          favouriteStore.$updateItem(item, ...selectCardKeys, ...item.belongTo)
        )))
      } catch { }
      cancel()
      break
  }
}
const selCard = useTemplateRef('selCard')

const config = useConfig()
const isSearching = shallowRef(false)
const searchText = shallowRef('')
const [zIndex] = useZIndex(isSearching)

const isShowMore = shallowRef(false)

</script>

<template>
  <FavouriteSelect2 ref="selCard" />
  <Layout title="">
    <template #rightNav>
      <NIcon size="calc(var(--spacing) * 6.5)" class="van-haptics-feedback" color="var(--van-text-color-2)"
        @click="isSearching = true">
        <SearchFilled />
      </NIcon>
      <NIcon size="1.5rem" class="van-haptics-feedback" @click="showSelect = true" color="var(--van-text-color-2)">
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24">
          <g fill="none">
            <path
              d="M6.78 4.78a.75.75 0 0 0-1.06-1.06L3.75 5.69l-.47-.47a.75.75 0 0 0-1.06 1.06l1 1a.75.75 0 0 0 1.06 0l2.5-2.5zm14.47 13.227H9.75l-.102.007a.75.75 0 0 0 .102 1.493h11.5l.102-.007a.75.75 0 0 0-.102-1.493zm0-6.507H9.75l-.102.007A.75.75 0 0 0 9.75 13h11.5l.102-.007a.75.75 0 0 0-.102-1.493zm0-6.5H9.75l-.102.007A.75.75 0 0 0 9.75 6.5h11.5l.102-.007A.75.75 0 0 0 21.25 5zM6.78 17.78a.75.75 0 1 0-1.06-1.06l-1.97 1.97l-.47-.47a.75.75 0 0 0-1.06 1.06l1 1a.75.75 0 0 0 1.06 0l2.5-2.5zm0-7.56a.75.75 0 0 1 0 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-1-1a.75.75 0 1 1 1.06-1.06l.47.47l1.97-1.97a.75.75 0 0 1 1.06 0z"
              fill="currentColor"></path>
          </g>
        </svg>
      </NIcon>
      <NIcon size="calc(var(--spacing) * 6.5)" class="rotate-90 van-haptics-feedback" color="var(--van-text-color-2)"
        @click="isShowMore = true">
        <MoreHorizRound />
      </NIcon>
    </template>
    <template #bottomNav>
      <div class="w-full flex flex-col pl-5 mt-3 mb-4">
        <div class="text-lg font-semibold mb-1">{{ card.title }}</div>
        <div class="text-sm text-(--van-text-color-2) mb-2">{{ card.description }}</div>
        <div class="text-xs text-(--van-text-color-2)/80">{{ items.length }}个内容</div>
      </div>
    </template>
    <template #topNav>
      <AnimatePresence>
        <motion.div v-if="showSelect"
          class="shadow-lg w-[95%] overflow-hidden fixed font-normal text-normal flex items-center z-2 top-safe-offset-12 left-1/2 -translate-x-1/2 bg-(--van-background-2) rounded-lg h-12"
          :initial="{ translateY: '-100%', opacity: 0 }" :animate="{ translateY: '0%', opacity: 1 }"
          :exit="{ translateY: '-100%', opacity: 0 }">
          <div class="ml-2 w-full flex items-center">
            <span class="bg-(--van-gray-1) px-1.5 text-[16px] rounded">
              已选<span class="text-(--nui-primary-color) px-0.5">{{ selectList.size }}</span>项
            </span>
          </div>
          <div class="flex text-nowrap items-center">
            <NButton class="!h-11" quaternary @click="selectAll()">全选</NButton>
            <VanButton square type="warning" @click="cancel()">取消</VanButton>
            <VanPopover
              :actions="[{ text: '复制到', label: 'copyTo' }, { text: '移动到', label: 'moveTo' }, { text: '删除', label: 'remove', color: 'var(--van-danger-color)' }]"
              @select="q => doAction(q.label)" placement="bottom-end">
              <template #reference>
                <VanButton square type="primary">操作</VanButton>
              </template>
            </VanPopover>
          </div>
        </motion.div>
        <div :class="[isSearching ? 'rounded-lg w-[calc(100%-8px)] right-1' : isEmpty(searchText)
          ? 'rounded-full w-1/2 right-[41px] !opacity-0 pointer-events-none' : 'rounded-full w-1/2 ml-3 right-[41px]']"
          class="transition-all duration-200 border-solid border bg-(--van-background-2) opacity-100 absolute !z-1000 border-gray-400 text-gray-400 h-[36px] px-1 flex items-center">
          <VanIcon name="search" color="rgb(156 163 175)" size="1.5rem" />
          <form action="/" @submit.prevent class="h-full w-full">
            <input type="search" class="h-full w-full border-none bg-transparent !font-normal"
              :class="[config['app.darkMode'] ? '!text-white' : '!text-black']" spellcheck="false"
              @focus="isSearching = true" v-model="searchText" ref="inputEl"
              @blur="isEmpty(searchText) || favouriteStore.infoFilters.unshift(searchText)" />
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
    <Waterfall class="!h-full" :source="{ data: PromiseContent.resolve(items), isEnd: true }" v-slot="{ item }" :col="1"
      :gap="0" :padding="0" :minHeight="0"
      :data-processor="v => isSearching ? v.filter(v => v.title.includes(searchText)) : v">
      <div class="w-full relative">
        <FavouriteItem :height="130" :item />
        <AnimatePresence>
          <motion.div @click="showSelect && (selectList.has(item) ? selectList.delete(item) : selectList.add(item))"
            v-if="showSelect" class="w-full h-full absolute top-0 left-0" :initial="{ opacity: 0 }"
            :animate="{ opacity: 1 }" :exit="{ opacity: 0 }">
            <div class="flex justify-center items-center absolute top-0 right-0 h-full w-15">
              <motion.div v-if="showSelect && selectList.has(item)" :initial="{ opacity: 0 }" :animate="{ opacity: 1 }"
                :exit="{ opacity: 0 }"
                class="absolute top-0 right-0 h-full w-15 bg-[linear-gradient(to_left,_var(--nui-primary-color),_transparent)]">
              </motion.div>
              <Motion :initial="{ translateX: '100%' }" :animate="{ translateX: '0%' }" :exit="{ translateX: '100%' }"
                v-if="showSelect">
                <VanCheckbox :model-value="selectList.has(item)" class="bg-(--van-background-2) z-1 rounded-full" />
              </Motion>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </Waterfall>
  </Layout>

  <Popup v-model:show="isShowMore" position="bottom" round class="!bg-(--van-background) !py-6">
    <VanCellGroup inset>
      <NPopconfirm @positive-click="$router.force.replace('/user/favourite').then(() => favouriteStore.$removeCard(cardKey))">
        <template #trigger>
          <VanCell center title="删除收藏夹">
            <template #icon>
              <NIcon size="1.4rem">
                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 16 16">
                  <g fill="none">
                    <path
                      d="M6.5 7v4a.5.5 0 0 0 1 0V7a.5.5 0 0 0-1 0zM9 6.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-1 0V7a.5.5 0 0 1 .5-.5zM10 4h3a.5.5 0 0 1 0 1h-.553l-.752 6.776A2.5 2.5 0 0 1 9.21 14H6.79a2.5 2.5 0 0 1-2.485-2.224L3.552 5H3a.5.5 0 0 1 0-1h3a2 2 0 1 1 4 0zM8 3a1 1 0 0 0-1 1h2a1 1 0 0 0-1-1zM4.559 5l.74 6.666A1.5 1.5 0 0 0 6.79 13h2.42a1.5 1.5 0 0 0 1.49-1.334L11.442 5H4.56z"
                      fill="currentColor"></path>
                  </g>
                </svg>
              </NIcon>
            </template>
          </VanCell>
        </template>
        删除后内容不可恢复
      </NPopconfirm>
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
          <template v-if="!isEmpty(favouriteStore.infoFilters)">
            <VanCell v-for="filter of favouriteStore.infoFilters" :title="filter" @click="searchText = filter"
              class="van-haptics-feedback w-full" />
          </template>
        </VanList>
      </motion.div>
    </AnimatePresence>
  </Teleport>
</template>