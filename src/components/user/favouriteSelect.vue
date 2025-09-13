<script setup lang='ts'>
import { useFavouriteStore } from '@/db/favourite'
import { isEmpty } from 'lodash-es'
import { useTemplateRef, computed, shallowRef } from 'vue'
import { PlusFilled, StarFilled } from '@vicons/material'
import { uni } from '@/api/union'
import { cosav } from '@/api/cosav'

const $props = defineProps<{
  item: uni.comic.Comic | cosav.video.BaseVideo
}>()
const createFavouriteCard = useTemplateRef('createFavouriteCard')
const favouriteStore = useFavouriteStore()
const favKey = computed(() => $props.item && favouriteStore.createValueKey($props.item))
const allFavouriteItems = computed(() => [...favouriteStore.favouriteItem.values()])
const allFavouriteCards = computed(() => [...favouriteStore.favouriteCards.values()])
const favouriteThis = (inCard: string) => {
  if (!$props.item || !favKey.value) return
  const item = favouriteStore.favouriteItem.get(favKey.value)
  if (item && item.belongTo.includes(inCard)) {
    // remove
    const aim = item.belongTo.filter(v => v != inCard)
    favouriteStore.$updateItem($props.item, ...aim)
  } else {
    // add
    favouriteStore.$updateItem($props.item, inCard, ...(item?.belongTo ?? []))
  }
}
const isShowFavouritePopup = shallowRef(false)

const isFavouriteInAny = computed(() => {
  if (!favKey.value) return false
  const item = favouriteStore.favouriteItem.get(favKey.value)
  if (!item) return false
  return !isEmpty(item.belongTo)
})
</script>

<template>
  <ToggleIcon padding size="27px" @click="favouriteThis(favouriteStore.defaultPack.key)" :model-value="isFavouriteInAny"
    :icon="StarFilled" @long-click="isShowFavouritePopup = true">
    收藏
  </ToggleIcon>
  <Popup v-model:show="isShowFavouritePopup" position="bottom" round class="!bg-(--van-background)">
    <div class="m-(--van-cell-group-inset-padding) w-full !mb-2 mt-2 font-semibold relative">
      选择收藏夹
      <div @click="createFavouriteCard?.create()"
        class="flex items-center font-normal text-(--van-text-color-2) !text-xs absolute right-8 top-1/2 -translate-y-1/2">
        <NIcon>
          <PlusFilled />
        </NIcon>
        新建收藏夹
      </div>
    </div>
    <VanCellGroup inset class="!mb-6">
      <Var v-for="card of allFavouriteCards" :value="allFavouriteItems.filter(v => v.belongTo.includes(card.key))"
        v-slot="{ value }">
        <VanCell center :title="card.title" :label="`${value.length}个内容`" clickable @click="favouriteThis(card.key)">
          <template #right-icon>
            <NCheckbox :checked="!!value.find(v => v.key == favKey)" />
          </template>
        </VanCell>
      </Var>
    </VanCellGroup>
  </Popup>
  <CreateFavouriteCard ref="createFavouriteCard" />
</template>