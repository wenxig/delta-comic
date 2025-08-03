<script setup lang='ts'>
import { isNumber } from 'lodash-es'
import { LoadingProps } from 'vant'
import { computed } from 'vue'

const $props = withDefaults(defineProps<Partial<LoadingProps>>(), {

})
const fontSize = computed(() => isNumber($props.size) ? `${$props.size}px` : $props.size)
</script>

<template>
  <VanLoading :="$props">
    <slot></slot>
  </VanLoading>
</template>
<style scoped lang='scss'>
:deep(.van-loading__text) {
  font-size: v-bind(fontSize);
  margin-left: 2px;
}
</style>