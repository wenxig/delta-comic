<script setup lang='ts'>
import { Comp, uni } from 'delta-comic-core'
import { isString } from 'es-toolkit'

defineProps<{
  author: {
    $$plugin: string
    icon: string | uni.image.RawImage
  }
  sizeSpacing: number
}>()
</script>

<template>
  <div class="size-(--box-size) rounded-full flex items-center justify-center bg-gray-200 aspect-square"
    :style="`--box-size:${sizeSpacing};`" v-if="isString(author.icon)">
    <NIcon color="var(--p-color)" :size="`calc(var(--spacing) * ${sizeSpacing / 10 * 6.5})`">
      <component :is="uni.item.Item.authorIcon.get([author.$$plugin, author.icon])" />
    </NIcon>
  </div>
  <Comp.Image class="size-(--box-size) shrink-0 mx-3 aspect-square" v-else :src="uni.image.Image.create(author.icon)"
    round fit="cover" :style="`--box-size:${sizeSpacing};`" />
</template>