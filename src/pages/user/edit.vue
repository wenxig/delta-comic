<script setup lang='ts'>
import { uni } from 'delta-comic-core'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
const $route = useRoute()
const plugin = $route.params.plugin.toString()
const editor = computed(() => uni.user.User.userEditorBase.get(plugin))
</script>

<template>
  <component v-if="editor" :is="editor"/>
</template>