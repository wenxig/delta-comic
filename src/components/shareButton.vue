<script setup lang='ts'>
import { ShareSharp } from '@vicons/material'
import { Comp, uni, type PluginShareInitiativeItem } from 'delta-comic-core'
import { computed } from 'vue'
import { shallowRef } from 'vue'
import ImagedIcon from './ImagedIcon.vue'
const $props = defineProps<{
  page: uni.content.ContentPage
}>()
const showShare = shallowRef(false)
const methods = computed(() => Array.from(uni.content.ContentPage.share.entries()).filter(v => v[1].filter($props.page)))
const handleClick = (method: PluginShareInitiativeItem) => {
  showShare.value = false
  return method.call($props.page)
}
</script>

<template>
  <Comp.ToggleIcon padding size="27px" :icon="ShareSharp" dis-changed @click="showShare = true">
    分享
  </Comp.ToggleIcon>
  <Comp.Popup v-model:show="showShare" round position="bottom" class="h-fit !bg-(--van-background)">
    <div class="w-full pt-4 pb-1 !text-base bg-(--van-background-2) text-center">分享该内容</div>
    <div
      class="w-full h-fit overflow-y-hidden overflow-x-auto scrollbar py-5 bg-(--van-background-2) mb-3 flex gap-1 px-1">
      <div v-for="method of methods" class="h-full flex flex-col w-fit items-center justify-around"
        @click="handleClick(method[1])">
        <ImagedIcon :size-spacing="12" :icon="method[1].icon" :bgColor="method[1].bgColor ?? 'var(--color-gray-200)'" />
        <div class="text-wrap w-18 !text-xs mt-1 text-center !text-(--van-text-color-2) van-multi-ellipsis--l2">
          {{ method[1].name }}
        </div>
      </div>
    </div>
    <VanButton block size="large" class="!w-full !border-none" @click="showShare = false">取消</VanButton>
  </Comp.Popup>
</template>