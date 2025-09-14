<script setup lang='ts'>
import { useRoute } from 'vue-router'
import Layout from '../layout.vue'
import { MoreHorizRound, SearchFilled } from '@vicons/material'
import { useFavouriteStore } from '@/db/favourite'
import { computed, shallowRef } from 'vue'
import { sortBy } from 'lodash-es'
import FavouriteItem from './favouriteItem.vue'
import { PromiseContent } from '@/utils/data'
import { useDialog } from 'naive-ui'
import { createLoadingMessage } from '@/utils/message'
import FavouriteSelect2 from './favouriteSelect.vue'
import { useTemplateRef } from 'vue'
import Searcher from '../searcher.vue'
import Action from '../action.vue'
const $route = useRoute()
const cardKey = $route.params.id.toString()
const favouriteStore = useFavouriteStore()
const card = computed(() => favouriteStore.favouriteCards.get(cardKey)!)
const items = computed(() => sortBy([...favouriteStore.favouriteItem.values()].filter(v => v.belongTo.includes(cardKey)), v => v.addtime))

const cancel = () => {
  actionController.value!.showSelect = false
  actionController.value?.selectList.clear()
}
const actionController = useTemplateRef('actionController')
const $dialog = useDialog()
const selCard = useTemplateRef('selCard')

const searcher = useTemplateRef('searcher')

const isShowMore = shallowRef(false)

const $window = window
</script>

<template>
  <FavouriteSelect2 ref="selCard" />
  <Action ref="actionController" :action="[{
    text: '移动', async onTrigger(sel) {
      try {
        if (!selCard) return
        const selectCardKeys = await selCard!.create()
        await createLoadingMessage('移动中').bind($window.Promise.all(sel.map(item =>
          favouriteStore.$updateItem(item, ...selectCardKeys, ...item.belongTo.filter(aim => aim != cardKey))
        )))
      } catch { }
      cancel()
    },
  }, {
    text: '复制', async onTrigger(sel) {
      try {
        if (!selCard) return
        const selectCardKeys = await selCard!.create()
        await createLoadingMessage('复制中').bind($window.Promise.all(sel.map(item =>
          favouriteStore.$updateItem(item, ...selectCardKeys, ...item.belongTo)
        )))
      } catch { }
      cancel()
    },
  }, {
    text: '删除', color: 'var(--van-danger-color)', onTrigger(sel) {
      $dialog.warning({
        title: '警告',
        content: `你确认删除${sel.length}项?`,
        positiveText: '确定',
        negativeText: '取消',
        onPositiveClick: () => {
          createLoadingMessage('删除中').bind($window.Promise.all(
            sel.map(item => favouriteStore.$updateItem(item, ...item.belongTo.filter(aim => aim != cardKey)))
          ))
          cancel()
        }
      })
    },
  }]" :values="items" v-slot="{ ActionBar, SelectPacker }">
    <Layout title="">
      <template #rightNav>
        <NIcon size="calc(var(--spacing) * 6.5)" class="van-haptics-feedback" color="var(--van-text-color-2)"
          @click="searcher && (searcher!.isSearching = true)">
          <SearchFilled />
        </NIcon>
        <NIcon size="1.5rem" class="van-haptics-feedback" @click="actionController!.showSelect = true" color="var(--van-text-color-2)">
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
        <component :is="ActionBar" />
        <Searcher v-model:filters-history="favouriteStore.infoFilters" ref="searcher" />
      </template>
      <Waterfall class="!h-full" un-reloadable :source="{ data: PromiseContent.resolve(items), isEnd: true }" v-slot="{ item }"
        :col="1" :gap="0" :padding="0" :minHeight="0"
        :data-processor="v => searcher?.isSearching ? v.filter(v => v.title.includes(searcher?.searchText ?? '')) : v">
        <component :is="SelectPacker" :it="item">
          <FavouriteItem :height="130" :item />
        </component>
      </Waterfall>
    </Layout>
  </Action>

  <Popup v-model:show="isShowMore" position="bottom" round class="!bg-(--van-background) !py-6">
    <VanCellGroup inset>
      <NPopconfirm
        @positive-click="$router.force.replace('/user/favourite').then(() => favouriteStore.$removeCard(cardKey))">
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
</template>