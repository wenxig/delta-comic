<script setup lang='ts' generic="T extends {
  name: string,
  title: string
}">
import { TabsInstance } from 'vant'
import { nextTick, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const $props = defineProps<{
  items: T[],
  routerBase: string,
}>()
const $route = useRoute()
const defaultRouter = $route.path.replaceAll($props.routerBase, '').replace(/^\//, '')
const select = ref(defaultRouter)
defineSlots<{
  default(arg: { itemName: T }): any
}>()
const $router = useRouter()
const tab = useTemplateRef<TabsInstance>('tab')
const beforeChange = async (aim: string) => {
  await $router.force.replace(`${$props.routerBase}/${aim}`)
  return true
}
watch(select, console.trace)
onMounted(() => console.log('draw'))
</script>

<template>
  <VanTabs ref="tab" shrink :active="select" :beforeChange class="w-full">
    <VanTab v-for="item of items" :title="item.title" @click="select = item.name" :name="item.name"></VanTab>
  </VanTabs>
</template>