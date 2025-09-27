<script setup lang='ts'>
import { HistoryItem } from '@/db/history'
import { UserOutlined } from '@vicons/antd'
import { PhoneAndroidOutlined } from '@vicons/material'
import { Comp, Db, uni, Utils } from 'delta-comic-core'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
defineProps<{
  item: HistoryItem & { itemBase: Db.SaveItem }
}>()
const $router = useRouter()

</script>

<template>
  <Comp.Var :value="new uni.item.Item(item.itemBase.item)" v-slot="{ value }">
    <Comp.content.UnitCard :item="value"
      @click="$router.force.push(`/content/${value.$$plugin}/${uni.content.ContentPage.toContentTypeString(value.contentType)}/${value.id}/${item.ep.index}`)">
      <div class="flex flex-nowrap items-center *:text-nowrap van-ellipsis">
        <NIcon color="var(--van-text-color-2)" size="14px">
          <UserOutlined />
        </NIcon>
        <span v-for="author of value.author" class="mr-2 van-haptics-feedback">{{ author }}</span>
      </div>
      <div class="flex flex-nowrap items-center *:text-nowrap van-ellipsis">
        <NIcon color="var(--van-text-color-2)" size="14px">
          <PhoneAndroidOutlined />
        </NIcon>
        <span class="mr-2 van-haptics-feedback">{{ Utils.translate.createDateString(dayjs(item.timestamp)) }}</span>
      </div>
    </Comp.content.UnitCard>
  </Comp.Var>
</template>