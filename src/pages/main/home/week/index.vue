<script setup lang='ts'>
import { useJmStore } from '@/stores'

const jmStore = useJmStore()
</script>

<template>
  <div class="flex flex-col size-full overflow-hidden">
    <NSelect filterable clearable remote />
    <RouterView />
  </div>
</template>