<script setup lang='ts'>
import { UserOutlined } from '@vicons/antd'
import { TimerRound } from '@vicons/material'
import { Comp,  uni, Utils } from 'delta-comic-core'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { SaveItem } from '@/db/app'
import { RecentViewItem } from '@/db/recentView'
defineProps<{
  item: RecentViewItem & { itemBase: SaveItem }
}>()
const $router = useRouter()

</script>

<template>
  <Comp.Var v-if="item.itemBase" :value="item.itemBase?.item" v-slot="{ value }">
    <Comp.content.UnitCard :item="value">
      <div class="flex flex-nowrap items-center *:text-nowrap van-ellipsis">
        <NIcon color="var(--van-text-color-2)" size="14px">
          <UserOutlined />
        </NIcon>
        <span v-for="author of value.author" class="mr-2 van-haptics-feedback">{{ author }}</span>
      </div>
      <div class="flex flex-nowrap items-center *:text-nowrap van-ellipsis">
        <NIcon color="var(--van-text-color-2)" size="14px">
          <TimerRound />
        </NIcon>
        <span class="mr-2 van-haptics-feedback">{{ Utils.translate.createDateString(dayjs(item.timestamp)) }}</span>
      </div>
    </Comp.content.UnitCard>
  </Comp.Var>
</template>