<script setup lang='ts'>
import { ShareSharp } from '@vicons/material'
import { Comp } from 'delta-comic-core'
import type { ShareSheetOption } from 'vant'
import { computed } from 'vue'
import { shallowRef } from 'vue'

const showShare = shallowRef(false)
const options = computed<ShareSheetOption[]>(() => {

})
</script>

<template>
  <Comp.ToggleIcon padding size="27px" :icon="ShareSharp" dis-changed>
    分享
  </Comp.ToggleIcon>
  <VanShareSheet v-model:show="showShare" title="立即分享给好友" :options="options" />
</template>