<script setup lang='ts'>
defineProps<{
  title: string
}>()
defineSlots<{
  rightNav(): void
  topNav(): void
  default(): void
}>()
</script>

<template>
  <div class="w-full h-screen flex flex-col">
    <div class="w-full pt-safe bg-(--van-background-2)"></div>
    <div class="flex flex-col w-full bg-(--van-background-2)">
      <div class="w-full h-13 flex text-xl font-bold items-center relative justify-center">
        <VanIcon name="arrow-left" size="calc(var(--spacing) * 6)" class="!absolute left-3 van-haptics-feedback"
          @click="$router.back()" color="var(--van-text-color-2)" />
        <span>{{ title }}</span>
        <slot name="rightNav" />
      </div>
      <slot name="topNav" />
    </div>
    <div class="size-full">
      <slot />
    </div>
  </div>
</template>