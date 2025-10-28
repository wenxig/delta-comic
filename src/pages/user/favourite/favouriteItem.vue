<script setup lang='ts'>
import { UserOutlined } from '@vicons/antd'
import { Comp, uni, Utils } from 'delta-comic-core'
defineProps<{
  item: uni.item.RawItem
  ep: uni.ep.Ep['index']
}>()

</script>

<template>
  <Comp.content.UnitCard :item>
    <div class="flex flex-nowrap items-center *:text-nowrap van-ellipsis">
      <NIcon color="var(--van-text-color-2)" size="14px">
        <UserOutlined />
      </NIcon>
      <span v-for="author of item.author" class="mr-2 van-haptics-feedback">{{ author }}</span>
    </div>
  </Comp.content.UnitCard>
</template>