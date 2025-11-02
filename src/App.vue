<script setup lang="ts">
import { Utils } from 'delta-comic-core'
import { recentViewDb } from './db/recentView'
import { toRaw } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const $router = useRouter()
const $route = useRoute()

Utils.eventBus.SharedFunction.define(item => recentViewDb.$push({
  item: toRaw(item),
  ep: toRaw(item.thisEp)
}), 'core', 'addRecent')
await $router.push($route.fullPath)
</script>

<template>
  <RouterView :key="$route.meta.force ? $route.fullPath : undefined" v-slot="{ Component }">
    <component :is="Component" />
  </RouterView>
</template>