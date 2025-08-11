<script setup lang='ts'>
import { useRoute } from 'vue-router'
import { shallowRef, inject, watch, computed } from 'vue'
import symbol from '@/symbol'
import { ComponentExposed } from 'vue-component-type-helpers'
import Waterfall from '@/components/waterfall.vue'
import { useBikaStore, useJmStore } from '@/stores'
import { PromiseContent, RPromiseContent } from '@/utils/data'
import { jm } from '@/api/jm'
import { bika } from '@/api/bika'

const $route = useRoute()
const name = decodeURI($route.params.name.toString())
const namespace = $route.params.namespace.toString() as 'jm' | 'bk'
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
  switch (namespace) {
    case 'jm': {
      return jmStore.preload.promote.useProcessor<jm.comic.CommonComic[] | bika.comic.CommonComic[]>(v => v.find(v => v.title == name)?.$content ?? [])
    }
    case 'bk': {
      return bikaStore.preload.collections.useProcessor<jm.comic.CommonComic[] | bika.comic.CommonComic[]>(v => v.find(v => v.title == name)?.$comics ?? [])
    }
  }
})
console.log(dataSource)
</script>

<template>
  <Waterfall :source="{ data: <any>dataSource, isEnd: true }"
    v-slot="{ item }: { item: jm.comic.CommonComic | bika.comic.CommonComic }" ref="list">
    <ComicCard :comic="item" :height="false" type="small" />
  </Waterfall>
</template>