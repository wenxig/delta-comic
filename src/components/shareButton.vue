<script setup lang='ts'>
import { ShareSharp } from '@vicons/material'
import { Comp, uni } from 'delta-comic-core'
import { computed } from 'vue'
import { shallowRef } from 'vue'
const $props = defineProps<{
  page: uni.content.ContentPage
}>()
const showShare = shallowRef(false)
const options = computed(() => Array.from(uni.content.ContentPage.share.entries().filter(v => v[1].filter($props.page))))
</script>

<template>
  <Comp.ToggleIcon padding size="27px" :icon="ShareSharp" dis-changed>
    分享
  </Comp.ToggleIcon>
  <Comp.Popup v-model:show="showShare" round position="bottom" class="h-30">
    <VanButton block size="large" class="!w-full">取消</VanButton>
  </Comp.Popup>
</template>