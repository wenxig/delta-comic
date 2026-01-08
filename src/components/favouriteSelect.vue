<script setup lang='ts'>
import { useTemplateRef, shallowRef, shallowReactive } from 'vue'
import { PlusFilled, StarOutlineRound } from '@vicons/material'
import { useMessage } from 'naive-ui'
import { Comp, uni, } from 'delta-comic-core'
import { FavouriteCard, FavouriteDB } from '@/db/favourite'
import { StarFilled } from '@vicons/antd'
import { db, useDBComputed } from '@/db'


const $props = defineProps<{
  item: uni.item.Item
  plain?: boolean
}>()

const createFavouriteCard = useTemplateRef('createFavouriteCard')
const selectList = shallowReactive(new Set<(FavouriteCard['createAt'])>())
const allFavouriteCards = useDBComputed(() => db.selectFrom('favouriteCard').selectAll().execute(), [])

const isShow = shallowRef(false)
const $message = useMessage()

let promise = Promise.withResolvers<(FavouriteCard['createAt'])[]>()

const create = async () => {
  promise = Promise.withResolvers<(FavouriteCard['createAt'])[]>()
  if (isShow.value) {
    $message.warning('正在选择中')
    promise.reject()
    return promise.promise
  }
  selectList.clear()
  const items = await db.selectFrom('favouriteItem').where('itemKey', '=', $props.item.id).selectAll().execute()
  for (const v of items) selectList.add(v.belongTo)
  isShow.value = true
  return await promise.promise
}
const submit = () => {
  if (selectList.size === 0) {
    return $message.warning('不可为空')
  }
  promise.resolve([...selectList])
  selectList.clear()
  isShow.value = false
}

const favouriteThis = async (inCard: FavouriteCard['createAt'][]) =>
  db.transaction().execute(async () => {
    for (const card of inCard)
      await FavouriteDB.insertItem($props.item, card)
  })

</script>

<template>
  <Comp.Var v-slot="{ value: fCard }" :value="useDBComputed(() => db
    .selectFrom('favouriteItem')
    .where('itemKey', '=', item.id)
    .select([])
    .execute()
    , [])">
    <Comp.ToggleIcon padding :size="plain ? '35px' : '27px'" @long-click="create().then(favouriteThis)"
      @click="favouriteThis([0])" :model-value="fCard.value.length > 0" :icon="plain ? StarOutlineRound : StarFilled">
      {{ plain ? '' : '收藏' }}
    </Comp.ToggleIcon>
  </Comp.Var>
  <Comp.Popup v-model:show="isShow" position="bottom" round class="bg-(--van-background)!" @closed="promise.reject()">
    <div class="m-(--van-cell-group-inset-padding) w-full mb-2! mt-2 font-semibold relative">
      选择收藏夹
      <div @click="createFavouriteCard?.create()"
        class="flex items-center font-normal text-(--van-text-color-2) text-xs! absolute right-8 top-1/2 -translate-y-1/2">
        <NIcon>
          <PlusFilled />
        </NIcon>
        新建收藏夹
      </div>
    </div>
    <VanCellGroup inset class="mb-6!">
      <Comp.Var v-for="card of allFavouriteCards" v-slot="{ value: count }"
        :value="useLiveQueryRef(() => FavouriteItemDB.countByBelongTo(card.createAt), 0, FavouriteItemDB)">
        <VanCell center :title="card.title" :label="`${count.value ?? 0}个内容`" clickable
          @click="selectList.has(card.createAt) ? selectList.delete(card.createAt) : selectList.add(card.createAt)">
          <template #right-icon>
            <NCheckbox :checked="selectList.has(card.createAt)" />
          </template>
        </VanCell>
      </Comp.Var>
    </VanCellGroup>
    <NButton class="m-5! w-30!" @click="submit" strong secondary type="primary" size="large">
      确定
    </NButton>
  </Comp.Popup>
  <CreateFavouriteCard ref="createFavouriteCard" />
</template>