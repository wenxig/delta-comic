<script setup lang='ts'>
import { useJmStore } from '@/stores'
import { shallowRef } from 'vue'

const jmStore = useJmStore()
const select = shallowRef<string>()
</script>

<template>
  <div class="flex flex-col size-full overflow-hidden">
    <div class="flex">
      <NSelect filterable clearable v-model:value="select"
        :options="jmStore.preload.weekBest.data.value?.categories.map(v => ({ key: v.id, value: v.id, label: v.title || v.time }))" />
      <NSelect />
      <NSelect filterable clearable v-model:value="select"
        :options="jmStore.preload.weekBest.data.value?.categories.map(v => ({ key: v.id, value: v.id, label: v.title || v.time }))" />
      <NSelect />
    </div>
    <RouterView />
  </div>
</template>