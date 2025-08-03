<script setup lang='ts' generic="T extends Promise<unknown>">
import { shallowRef, watch } from 'vue'

defineSlots<{
  default(arg: { result: Awaited<T> | undefined, isReady: boolean, isError: boolean, failCause: any | undefined }): any
}>()
const $props = defineProps<{
  promise: T
  await?: boolean
}>()
const isReady = shallowRef(false)
const result = shallowRef<Awaited<T>>()
const isError = shallowRef(false)
const failCause = shallowRef()
let key = Symbol()
watch(() => $props.promise, promise => {
  const k = key = Symbol()
  result.value = undefined
  isError.value = isReady.value = false
  failCause.value = undefined
  promise.then(v => {
    if (k != key) return
    result.value = <Awaited<T>>v
  }).catch(r => {
    if (k != key) return
    isError.value = true
    failCause.value = r
  }).finally(() => {
    if (k != key) return
    isReady.value = true
  })
}, { immediate: true })
</script>

<template>
  <slot :result :isError :failCause :isReady v-if="!$props.await || isReady"></slot>
</template>