<script setup lang='ts'>
import { useRoute, useRouter } from 'vue-router'
import { shallowRef, inject, watch, computed } from 'vue'
import symbol from '@/symbol'
import { ComponentExposed } from 'vue-component-type-helpers'
import Waterfall from '@/components/waterfall.vue'
import { useBikaStore, useJmStore } from '@/stores'
import { PromiseContent } from '@/utils/data'

const $route = useRoute()
const $router = useRouter()
const id = decodeURI($route.params.id.toString())
const bikaStore = useBikaStore()
const jmStore = useJmStore()

const list = shallowRef<ComponentExposed<typeof Waterfall>>()
const showNavBar = inject(symbol.showNavBar)!
watch(() => list.value?.scrollTop, async (scrollTop, old) => {
  if (list.value?.scrollParent?.getBoundingClientRect().height ?? 0 < window.innerHeight) return
  if (!scrollTop || !old) return
  if (scrollTop - old > 0) showNavBar.value = false
  else showNavBar.value = true
}, { immediate: true })
const dataSource = computed(() => {
  if (Number.isNaN(Number(id))) {
    if (bikaStore.preload.collections.isLoading.value) {
      $router.force.push('/')
      return PromiseContent.withResolvers(true).content
    }
    return bikaStore.preload.collections.useProcessor(v => v.find(v => v.title == id)?.$comics.map(v => v.toUniComic()) ?? [])
  }
  else {
    if (jmStore.preload.promote.isLoading.value) {
      $router.force.push('/')
      return PromiseContent.withResolvers(true).content
    }
    return jmStore.preload.promote.useProcessor(v => v.find(v => Number(v.id) == Number(id))?.$content.map(v => v.toUniComic()) ?? [])
  }
})
</script>

<template>
  <Waterfall :source="{ data: <any>dataSource, isEnd: true }"
    v-slot="{ item }" ref="list">
    <ComicCard :comic="item" :height="false" type="small" />
  </Waterfall>
</template>