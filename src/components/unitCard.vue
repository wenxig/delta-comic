<script setup lang='ts'>
import { computed, StyleValue, useTemplateRef } from 'vue'
import { MoreVertRound } from '@vicons/material'
import { createReusableTemplate } from '@vueuse/core'
import { Comp, Store, uni, Utils } from 'delta-comic-core'
const $props = withDefaults(defineProps<{
  item: uni.item.Item | uni.item.RawItem
  freeHeight?: boolean
  disabled?: boolean
  type?: 'default' | 'big' | 'small'
  class?: any
  style?: StyleValue
}>(), {
  type: 'default'
})
const $emit = defineEmits<{
  click: []
}>()
const cover = useTemplateRef<InstanceType<typeof Comp.Image>>('cover')
const $cover = computed(() => uni.item.Item.is($props.item) ? $props.item.$cover : uni.image.Image.create($props.item.cover))
const imageRatio = computed(() => cover.value?.isLoaded ? 'unset' : `${$cover.value.aspect?.width || cover.value?.imageEl?.getBoundingClientRect().width || 3} / ${$cover.value.aspect?.height || cover.value?.imageEl?.getBoundingClientRect().height || 4}`)

defineSlots<{
  default(): void
  smallTopInfo(): void
  cover(): void
}>()
console.log('[cover]', cover)
const [TemplateIns, ComponentIns] = createReusableTemplate()
const handlePositiveClick = () => {
  // add recent
  if (uni.item.Item.is($props.item))
    Utils.eventBus.SharedFunction.call('addRecent', $props.item)
}
const config = Store.useConfig().$load(Store.appConfig)
const processedTitle = computed(() => config.easilyTitle ? $props.item.title.replace(/(\（[^\）]+\）|\[[^\]]+\]|\([^\)]+\)|\【[^\】]+\】)+?/ig, '').trim() : $props.item.title)

const handleClick = () => {
  Utils.eventBus.SharedFunction.call('routeToContent', $props.item.contentType, $props.item.id, $props.item.thisEp.index, uni.item.Item.is($props.item) ? $props.item : undefined)
  $emit('click')
}
</script>

<template>
  <TemplateIns>
    <NPopconfirm @positive-click="handlePositiveClick">
      <template #trigger>
        <NButton @click.stop text class="!absolute bottom-1.5 right-2">
          <NIcon color="var(--van-text-color-2)" size="1rem">
            <MoreVertRound />
          </NIcon>
        </NButton>
      </template>
      加入"稍后再看"?
    </NPopconfirm>
  </TemplateIns>
  <div ref="container" @click="handleClick" :disabled v-if="type != 'small'"
    class="overflow-hidden w-full van-hairline--top-bottom bg-(--van-background-2) text-(--van-text-color) relative p-2 flex"
    :style="[{ height: freeHeight ? 'auto' : '140px' }, style]"
    :class="[{ 'van-haptics-feedback': !disabled }, $props.class]">
    <Comp.Image :src="$cover" v-if="type === 'big'" class="blur-lg absolute top-0 left-0 w-full h-full" fit="cover" />
    <Comp.Image :src="$cover" class="!rounded-lg image-size z-2 w-3/10" fit="contain" ref="cover" />
    <div class="absolute image-size top-1/2 w-3/10 z-3">
      <slot name="cover" />
    </div>
    <div class="flex absolute flex-col w-[calc(70%-18px)] h-[calc(100%-8px)] *:text-justify right-2">
      <span class="van-multi-ellipsis--l2">{{ processedTitle }}</span>
      <div class="absolute bottom-2 text-(--van-text-color-2) text-sm">
        <slot />
      </div>
    </div>
    <ComponentIns />
  </div>

  <div :style="[{ height: freeHeight ? 'auto' : '140px' }, style]" v-else @click="handleClick" :disabled
    :class="[{ 'van-haptics-feedback': !disabled }, $props.class]" ref="container"
    class="overflow-hidden w-full rounded-lg block van-hairline--top-bottom bg-center bg-(--van-background-2) text-(--van-text-color) border-none relative p-0 items-center">
    <div class="w-full flex items-center relative">
      <Comp.Image :src="$cover" class="rounded-t-lg w-full image-size" fit="cover" ref="cover" />
      <slot name="cover" />
      <div
        class="absolute w-full h-6 !text-[10px] text-white bg-[linear-gradient(transparent,rgba(0,0,0,0.9))] bottom-0 flex pb-0.5 gap-1 pl-1 items-end justify-start *:flex *:items-center">
        <slot name="smallTopInfo" />
      </div>
    </div>
    <div class="w-full overflow-hidden p-1 flex flex-col text-(--van-text-color)">
      <div class="flex flex-nowrap">
        <span class="text-start text-sm">{{ processedTitle }}</span>
      </div>
      <div class=" my-1 w-full h-auto flex-nowrap flex items-center">
        <slot />
      </div>
    </div>
    <ComponentIns />
  </div>
</template>
<style scoped lang='css'>
:deep(.image-size) {
  aspect-ratio: v-bind("imageRatio");
}
</style>
