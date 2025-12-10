<script setup lang='ts'>
import { Comp, uni } from 'delta-comic-core'
import type { Component } from 'vue'

defineProps<{
  icon: Component | uni.image.Image
  bgColor?: string
  sizeSpacing: number
}>()
</script>

<template>
  <Comp.Image class="size-[calc(var(--spacing)*var(--box-size))] shrink-0 aspect-square" v-if="uni.image.Image.is(icon)"
    :src="icon" round fit="cover" :style="`--box-size:${sizeSpacing};background-color:${bgColor ?? ' var(--color-gray-200)'};`" />
  <div
    class="size-[calc(var(--spacing)*var(--box-size))] rounded-full flex items-center justify-center bg-gray-200 aspect-square"
    :style="`--box-size:${sizeSpacing};background-color:${bgColor ??' var(--color-gray-200)'};`" v-else>
    <NIcon color="var(--p-color)" :size="`calc(var(--spacing) * ${sizeSpacing / 10 * 6.5})`">
      <component :is="icon" />
    </NIcon>
  </div>
</template>