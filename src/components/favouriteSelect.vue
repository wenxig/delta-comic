<script setup lang='ts'>
import { useTemplateRef, shallowRef, shallowReactive } from 'vue'
import { PlusFilled, StarOutlineRound } from '@vicons/material'
import { useMessage } from 'naive-ui'
import { Comp, uni, } from 'delta-comic-core'
import { useLiveQueryRef } from '@/utils/db'
import { FavouriteCard, favouriteDB, defaultsFavouriteCard } from '@/db/favourite'
import { AppDB } from '@/db/app'
import { StarFilled } from '@vicons/antd'


const $props = defineProps<{
  item: uni.item.Item
  plain?: boolean
}>()
const thisKey = AppDB.createSaveItemKey($props.item)
const thisFavouriteItemRef = useLiveQueryRef(() => favouriteDB.favouriteItemBase.where('itemKey').equals(thisKey).first(), undefined)

const createFavouriteCard = useTemplateRef('createFavouriteCard')
const selectList = shallowReactive(new Set<(FavouriteCard['createAt'])>())
const allFavouriteItems = useLiveQueryRef(() => favouriteDB.favouriteItemBase.with({ itemBase: 'itemKey' }), [])
const allFavouriteCards = useLiveQueryRef(() => favouriteDB.favouriteCardBase.toArray(), [])

const isShow = shallowRef(false)
const $message = useMessage()

let promise = Promise.withResolvers<(FavouriteCard['createAt'])[]>()

const create = () => {
  promise = Promise.withResolvers<(FavouriteCard['createAt'])[]>()
  if (isShow.value) {
    $message.warning('正在选择中')
    promise.reject()
    return promise.promise
  }
  selectList.clear()
  const fItem = thisFavouriteItemRef.value
  for (const v of fItem?.belongTo ?? []) selectList.add(v)
  isShow.value = true
  return promise.promise
}
const submit = () => {
  if (selectList.size === 0) {
    return $message.warning('不可为空')
  }
  promise.resolve([...selectList])
  selectList.clear()
  isShow.value = false
}

const favouriteThis = async (inCard: FavouriteCard['createAt'][]) => {
  const fItem = thisFavouriteItemRef.value
  await favouriteDB.$setItems({
    aims: inCard,
    item: $props.item,
    fItem: fItem && {
      ...fItem,
      belongTo: []
    },
    ep: $props.item.thisEp
  })
}
</script>

<template>
  <Comp.ToggleIcon padding :size="plain ? '35px' : '27px'" @long-click="create().then(favouriteThis)"
    @click="defaultsFavouriteCard && favouriteThis([defaultsFavouriteCard.createAt])"
    :model-value="(thisFavouriteItemRef?.belongTo.length ?? 0) > 0" :icon="plain ? StarOutlineRound : StarFilled">
    收藏
  </Comp.ToggleIcon>
  <Comp.Popup v-model:show="isShow" position="bottom" round class="!bg-(--van-background)" @closed="promise.reject()">
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
      <Comp.Var v-for="card of allFavouriteCards"
        :value="allFavouriteItems.filter(v => v.belongTo.includes(card.createAt))" v-slot="{ value }">
        <VanCell center :title="card.title" :label="`${value.length}个内容`" clickable
          @click="selectList.has(card.createAt) ? selectList.delete(card.createAt) : selectList.add(card.createAt)">
          <template #right-icon>
            <NCheckbox :checked="selectList.has(card.createAt)" />
          </template>
        </VanCell>
      </Comp.Var>
    </VanCellGroup>
    <NButton class="!m-5 !w-30" @click="submit" strong secondary type="primary" size="large">
      确定
    </NButton>
  </Comp.Popup>
  <CreateFavouriteCard ref="createFavouriteCard" />
</template>