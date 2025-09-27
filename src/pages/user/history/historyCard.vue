<script setup lang='ts'>
import { HistoryItem } from '@/db/history'
import { UserOutlined } from '@vicons/antd'
import { PhoneAndroidOutlined } from '@vicons/material'
import { Comp, uni, Utils } from 'delta-comic-core';
import { useRouter } from 'vue-router';
import dayjs from 'dayjs';
defineProps<{
  item: HistoryItem & { itemBase: uni.item.RawItem }
  ep: uni.ep.Ep['index']
}>()
const $router = useRouter()

</script>

<template>
  <Comp.content.UnitCard :item="new uni.item.Item(item.itemBase)"
    @click="$router.force.push(`/content/${item.itemBase.$$plugin}/${uni.content.ContentPage.toContentTypeString(item.itemBase.contentType)}/${item.itemBase.id}/${ep}`)">
    <div class="flex flex-nowrap items-center *:text-nowrap van-ellipsis">
      <NIcon color="var(--van-text-color-2)" size="14px">
        <UserOutlined />
      </NIcon>
      <span v-for="author of item.itemBase.author" class="mr-2 van-haptics-feedback">{{ author }}</span>
    </div>
    <div class="flex flex-nowrap items-center *:text-nowrap van-ellipsis">
      <NIcon color="var(--van-text-color-2)" size="14px">
        <PhoneAndroidOutlined />
      </NIcon>
      <span class="mr-2 van-haptics-feedback">{{ Utils.translate.createDateString(dayjs(item.timestamp)) }}</span>
    </div>
  </Comp.content.UnitCard>
</template>