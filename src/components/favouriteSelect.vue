<script setup lang='ts'>
import { useTemplateRef, shallowRef } from 'vue'
import { PlusFilled, StarFilled } from '@vicons/material'
import { defaultsFavouriteCard, FavouriteCard, favouriteDB } from '@/db/favourite'
import { useLiveQueryRef } from '@/utils/db'
import CreateFavouriteCard from './createFavouriteCard.vue'
import { AppDB } from '@/db/app'
import { Comp, uni } from 'delta-comic-core'

const $props = defineProps<{
  item: uni.item.Item
}>()
const thisKey = AppDB.createSaveItemKey($props.item)
const thisFavouriteItemRef = useLiveQueryRef(() => favouriteDB.favouriteItemBase.where('itemKey').equals(thisKey).first(), undefined)
const createFavouriteCard = useTemplateRef('createFavouriteCard')
const favouriteThis = async (inCard: FavouriteCard['createAt']) => {
  const fItem = thisFavouriteItemRef.value
  await favouriteDB.$setItems({
    aims: [inCard],
    item: $props.item,
    fItem,
    ep: $props.item.thisEp
  })
}
const isShowFavouritePopup = shallowRef(false)

const allCards = useLiveQueryRef(() => favouriteDB.favouriteCardBase.toArray(), [])

const createCardSize = (card: FavouriteCard['createAt']) => useLiveQueryRef(() => favouriteDB.favouriteItemBase.where('belongTo').equals(card).toArray(), [])
</script>

<template>
  <Comp.ToggleIcon v-if="defaultsFavouriteCard" padding size="27px" @click="favouriteThis(defaultsFavouriteCard.createAt)"
    :model-value="(thisFavouriteItemRef?.belongTo.length ?? 0) > 0" :icon="StarFilled"
    @long-click="isShowFavouritePopup = true">
    收藏
  </Comp.ToggleIcon>
  <Comp.Popup v-model:show="isShowFavouritePopup" position="bottom" round class="!bg-(--van-background)">
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
      <Comp.Var v-for="card of allCards" :value="createCardSize(card.createAt).value" v-slot="{ value }">
        <VanCell center :title="card.title" :label="`${value.length}个内容`" clickable
          @click="favouriteThis(card.createAt)">
          <template #right-icon>
            <NCheckbox :checked="!!value.find(v => v.itemKey === thisKey)" />
          </template>
        </VanCell>
      </Comp.Var>
    </VanCellGroup>
  </Comp.Popup>
  <CreateFavouriteCard ref="createFavouriteCard" />
</template>