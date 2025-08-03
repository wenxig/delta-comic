<script setup lang='ts'>
import { PromiseContent } from '@/utils/data'
import { NButtonGroup } from 'naive-ui'
const pc = Promise.withResolvers<any>()
const source = PromiseContent.fromPromise(pc.promise)
</script>

<template>
  <div class="!w-[90vw] border mx-auto border-black border-solid !h-[70vh] overflow-hidden">
    <Content retriable :source class="!size-full">
      value
    </Content>
  </div>
  <NButtonGroup class="mx-auto !w-fit">
    <NButton @click="() => {
      source.isLoading = false
      source.isError = false
      source.isEmpty = true
    }">Resolve noData</NButton>
    <NButton @click="() => {
      source.isLoading = false
      source.isError = false
      source.isEmpty = false
    }">Resolve Data</NButton>
    <NButton @click="source.isLoading = true">Next</NButton>
    <NButton @click="() => {
      source.isLoading = false
      source.isError = true
      source.errorCause = 'error'
    }">Reject</NButton>
  </NButtonGroup>
  {{ source }}
</template>