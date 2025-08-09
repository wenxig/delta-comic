<script setup lang='ts'>
import { useRoute } from 'vue-router'
import { shallowRef, inject, watch } from 'vue'
import symbol from '@/symbol'
import { ComponentExposed } from 'vue-component-type-helpers'
import Waterfall from '@/components/waterfall.vue'
import { useBikaStore } from '@/stores'
import { PromiseContent } from '@/utils/data'
import { reactive } from 'vue'

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
const _Promise = Promise
</script>

<template>
  <!-- <Content :source="bikaStore.preload.collections">
    <Waterfall
      :source="{ data: PromiseContent.fromPromise(_Promise.resolve(bikaStore.preload.collections.data?.find(v => v.title == name)?.$comics ?? [])), isEnd: true }"
      v-slot="{ item }" ref="list">
      <ComicCard :comic="item" :height="false" type="small" />
    </Waterfall>
  </Content> -->
{{bikaStore.preload.collections.data?.find(v => v.title == name)?.$comics ?? [] }}
</template>