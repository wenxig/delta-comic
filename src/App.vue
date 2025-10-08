<script setup lang="ts">
import { Utils } from 'delta-comic-core'
import { recentViewDb } from './db/recentView'
import { toRaw } from 'vue'


Utils.eventBus.SharedFunction.define(item => recentViewDb.$push({
  item: toRaw(item),
  ep: toRaw(item.thisEp)
}), 'core', 'addRecent')
</script>

<template>
  <RouterView :key="$route.meta.force ? $route.fullPath : undefined" />
  <VanImagePreview :show="false" v-once />
</template>