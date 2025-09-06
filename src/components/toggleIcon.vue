<script setup lang='ts'>
import { Component as _Component, watch } from 'vue'

const $props = defineProps<{
  icon: _Component
  size?: string | number
  disChanged?: boolean
  rowMode?: boolean
  padding?: boolean
}>()
const $emit = defineEmits<{
  change: [mode: boolean]
  click: []
}>()
const mode = defineModel<boolean>({ default: false })
watch(mode, mode => $emit('change', mode))
const handleClick = () => {
  $emit('click')
  if (!$props.disChanged) mode.value = !mode.value
}
</script>

<template>
  <div class="flex items-center justify-center **:!transition-colors" :class="[rowMode || 'flex-col', padding &&'px-4']"
    @click.stop="handleClick">
    <NIcon :size :color="mode ? 'var(--nui-primary-color)' : ('var(--van-gray-7)')">
      <component :is="icon" />
    </NIcon>
    <span class="mt-1 text-(--van-text-color-2) text-xs">
      <slot />
    </span>
  </div>
</template>