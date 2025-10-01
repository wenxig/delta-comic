<script setup lang="ts">
</script>

<template>
  <Suspense>
    <RouterView :key="$route.meta.force ? $route.fullPath : undefined" />
  </Suspense>
  <VanImagePreview :show="false" v-once />
</template>