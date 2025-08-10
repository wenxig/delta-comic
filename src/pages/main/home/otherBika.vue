<script setup lang='ts'>
import { useRoute } from 'vue-router'
import { shallowRef, inject, watch } from 'vue'
import symbol from '@/symbol'
import { ComponentExposed } from 'vue-component-type-helpers'
import Waterfall from '@/components/waterfall.vue'
import { useBikaStore } from '@/stores'

const $route = useRoute()
const name = $route.params.name.toString()
const bikaStore = useBikaStore()

const list = shallowRef<ComponentExposed<typeof Waterfall>>()
const showNavBar = inject(symbol.showNavBar)!
watch(() => list.value?.scrollTop, async (scrollTop, old) => {
  if (list.value?.scrollParent?.getBoundingClientRect().height ?? 0 < window.innerHeight) return
  if (!scrollTop || !old) return
  if (scrollTop - old > 0) showNavBar.value = false
  else showNavBar.value = true
}, { immediate: true })
</script>

<template>
  <Waterfall
    :source="{ data: bikaStore.preload.collections.useProcessor(v => v.find(v => v.title == name)?.$comics ?? []), isEnd: true }"
    v-slot="{ item }" ref="list">
    <ComicCard :comic="item" :height="false" type="small" />
  </Waterfall>
</template>