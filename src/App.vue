<script setup lang="ts">
</script>

<template>
  <RouterView :key="$route.meta.force ? $route.fullPath : undefined" />
  <VanImagePreview :show="false" v-once />
</template>