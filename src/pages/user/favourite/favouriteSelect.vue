<script setup lang='ts'>
import { useFavouriteStore } from '@/db/favourite'
import { useTemplateRef, computed, shallowRef, shallowReactive } from 'vue'
import { PlusFilled } from '@vicons/material'
import { useMessage } from 'naive-ui'


const createFavouriteCard = useTemplateRef('createFavouriteCard')
const favouriteStore = useFavouriteStore()
const selectList = shallowReactive(new Set<string>())
const allFavouriteItems = computed(() => [...favouriteStore.favouriteItem.values()])
const allFavouriteCards = computed(() => [...favouriteStore.favouriteCards.values()])

const isShow = shallowRef(false)
const $message = useMessage()

let promise = Promise.withResolvers<string[]>()

const create = () => {
  promise = Promise.withResolvers<string[]>()
  if (isShow.value) {
    $message.warning('正在选择中')
    promise.reject()
    return promise.promise
  }
  selectList.clear()
  isShow.value = true
  return promise.promise
}
const submit = () => {
  if (selectList.size == 0) {
    return $message.warning('不可为空')
  }
  promise.resolve([...selectList])
  selectList.clear()
  isShow.value = false
}
defineExpose({
  create
})
</script>

<template>
  <Popup v-model:show="isShow" position="bottom" round class="!bg-(--van-background)" @closed="promise.reject()" >
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
        <VanCell center :title="card.title" :label="`${value.length}个内容`" clickable
          @click="selectList.has(card.key) ? selectList.delete(card.key) : selectList.add(card.key)">
          <template #right-icon>
            <NCheckbox :checked="selectList.has(card.key)" />
          </template>
        </VanCell>
      </Var>
    </VanCellGroup>
    <NButton class="!m-5 !w-30" @click="submit" strong secondary type="primary" size="large">
      确定
    </NButton>
  </Popup>
  <CreateFavouriteCard ref="createFavouriteCard" />
</template>