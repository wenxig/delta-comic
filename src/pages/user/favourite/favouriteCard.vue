<script setup lang='ts'>
import { useContentStore } from '@/stores/content'
import { LockOutlined } from '@vicons/antd'
import { ArrowForwardIosRound } from '@vicons/material'
import { Comp, Db, uni, Utils } from 'delta-comic-core'
import { isEmpty, sortBy } from 'lodash-es'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
const $props = defineProps<{
  isCardMode?: boolean
  card: Db.FavouriteCard
}>()

const _favouriteItems = Utils.db.useLiveQueryRef(() => Db.favouriteDB.favouriteItemBase.where('belongTo').equals($props.card.createAt).with<{ itemBase: Db.SaveItem }>({ itemBase: 'itemKey' }), [])
const favouriteItems = computed(() => sortBy(_favouriteItems.value, v => v.addtime).toReversed())
const $router = useRouter()
const contentStore = useContentStore()
const handleClick = (item: Db.SaveItem['item'], ep: Db.FavouriteItem['ep']) => {
  contentStore.$load(item.contentType, item.id, ep.index, uni.item.Item.create(item))
}
</script>

<template>
  <div v-if="isCardMode" @click="$router.force.push(`/user/favourite/${card.createAt}`)"
    class="overflow-hidden w-full rounded-xl flex flex-col bg-center bg-(--van-background-2) text-(--van-text-color) border-none relative active:bg-gray p-3 items-center van-haptics-feedback">
    <div class="flex items-center h-6 w-full relative">
      <div class="text-lg font-semibold">{{ card.title }}</div>
      <div class="flex items-center text-[13px] text-(--van-text-color-2) right-1 absolute">
        <template v-if="card.private">
          <NIcon size="16px">
            <LockOutlined />
          </NIcon>
          <span class="mx-1">·</span>
        </template>
        {{ favouriteItems.length }}个内容
        <NIcon size="15px">
          <ArrowForwardIosRound />
        </NIcon>
      </div>
    </div>
    <div class="flex mt-3 justify-around">
      <template v-if="isEmpty(favouriteItems)">
        <NEmpty description="无结果" class="w-full !justify-center" />
      </template>
      <template v-else>
        <div v-for="{ itemBase: { item }, ep } of favouriteItems.slice(0, 3)" class="flex flex-col !w-[30%] gap-2 "
          @click="handleClick(item, ep)">
          <Comp.Var :value="uni.item.Item.create(item)" v-slot="{ value: item }">
            <Comp.Image :src="item.$cover" class="!rounded-lg z-2" fit="cover" />
            <div class="van-multi-ellipsis--l2">{{ item.title }}</div>
          </Comp.Var>
        </div>
      </template>
    </div>
  </div>
  <div v-else @click="$router.force.push(`/user/favourite/${card.createAt}`)"
    class="overflow-hidden min-h-25 w-full rounded-xl flex bg-center bg-(--van-background-2) text-(--van-text-color) border-none relative active:bg-gray p-3 items-center van-haptics-feedback">
    <Comp.Var :value="uni.item.Item.create(favouriteItems[0].itemBase.item)" v-slot="{ value: item }">
      <div class="w-[40%]">
        <Comp.Image :src="item.$cover" class="!rounded-lg z-2 h-full ml-[1%]" fit="contain" />
      </div>
      <div class=" size-full flex ml-2">
        <div class="absolute w-full top-1 text-lg font-semibold">
          {{ card.title }}
        </div>
        <div class="absolute w-full bottom-4 text-sm flex items-center text-(--van-text-color-2)">
          <template v-if="card.private">
            <NIcon size="16px">
              <LockOutlined />
            </NIcon>
            <span class="mx-0.5">·</span>
          </template>
          {{ favouriteItems.length }}个内容
        </div>
      </div>
    </Comp.Var>
  </div>
</template>