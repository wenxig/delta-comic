<script setup lang='ts'>
import { Component as _Component, watch } from 'vue'
import { onLongPress } from '@vueuse/core'
import { useTemplateRef } from 'vue'

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
  longClick: []
}>()
const mode = defineModel<boolean>({ default: false })
watch(mode, mode => $emit('change', mode))
const handleClick = () => {
  $emit('click')
  if (!$props.disChanged) mode.value = !mode.value
}

const htmlRefHook = useTemplateRef('htmlRefHook')
onLongPress(htmlRefHook, () => {
  $emit('longClick')
}, {
  modifiers: {
    prevent: true
  }
})
</script>

<template>
  <div class="flex items-center justify-center **:!transition-colors"
    :class="[rowMode || 'flex-col', padding && 'px-4']" @click.stop="handleClick" ref="htmlRefHook">
    <NIcon :size :color="mode ? 'var(--nui-primary-color)' : ('var(--van-gray-7)')">
      <component :is="icon" />
    </NIcon>
    <span class="mt-1 text-(--van-text-color-2) text-xs">
      <slot />
    </span>
  </div>
</template>