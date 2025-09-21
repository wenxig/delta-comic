<script setup lang='ts'>
import { useBikaStore, useJmStore } from '@/stores'
import { CloudServerOutlined } from '@vicons/antd'
import { computed, shallowRef } from 'vue'

const bikaStore = useBikaStore()
bikaStore.$loadLevelboard()
const jmStore = useJmStore()
jmStore.$loadLevelboard()
const levelboardFrom = shallowRef<'jm' | 'bika' | 'total'>('bika')
const selects = computed(() => {
  const result = [
    {
      title: '日榜',
      name: 'day'
    }, {
      title: '周榜',
      name: 'week'
    }, {
      title: '月榜',
      name: 'month'
    }
  ]
  switch (levelboardFrom.value) {
    case 'jm':
    case 'total':
      return result
    case 'bika':
      return [...result, {
        title: '骑士榜',
        name: 'user'
      }]
  }
})
</script>

<template>
  <RouterTab class="w-full" routerBase="/main/home/level" :queries="{ from: levelboardFrom }" :items="selects">
    <template #left>
      <VanPopover :actions="[{ text: 'bika' }, { text: 'jm' }]" @select="q => levelboardFrom = q.text"
        placement="bottom-start">
        <template #reference>
          <NButton quaternary class="!pr-0 !pl-2 !mr-2">
            排行源:<span class="text-(--p-color) text-xs">{{ levelboardFrom }}</span>
            <template #icon>
              <NIcon size="1.8rem">
                <CloudServerOutlined />
              </NIcon>
            </template>
          </NButton>
        </template>
      </VanPopover>
    </template>
  </RouterTab>
  <div class="h-[calc(100%-44px)] w-full">
    <RouterView />
  </div>
</template>
<style scoped lang='scss'>
:deep(.van-popover__wrapper) {
  display: flex;
  align-items: center;
}
</style>