<script setup lang='ts'>
import { HistoryItem } from '@/db/history'
import { UserOutlined } from '@vicons/antd'
import { PhoneAndroidOutlined } from '@vicons/material'
import { Comp, coreModule, requireDepend, uni, Utils } from 'delta-comic-core'
import dayjs from 'dayjs'
import { SaveItem } from '@/db/app'
defineProps<{
  item: HistoryItem & { itemBase: SaveItem }
}>()

const { comp: { ItemCard } } = requireDepend(coreModule)
</script>

<template>
  <Comp.Var v-if="item.itemBase" :value="item.itemBase?.item" v-slot="{ value }">
    <ItemCard :item="uni.item.Item.create(value)">
      <div class="flex flex-nowrap items-center *:text-nowrap van-ellipsis">
        <NIcon color="var(--van-text-color-2)" size="14px">
          <UserOutlined />
        </NIcon>
        <span v-for="author of value.author" class="mr-2 van-haptics-feedback">{{ author.label }}</span>
      </div>
      <div class="flex flex-nowrap items-center *:text-nowrap van-ellipsis">
        <NIcon color="var(--van-text-color-2)" size="14px">
          <PhoneAndroidOutlined />
        </NIcon>
        <span class="mr-2 van-haptics-feedback">{{ Utils.translate.createDateString(dayjs(item.timestamp)) }}</span>
      </div>
    </ItemCard>
  </Comp.Var>
</template>