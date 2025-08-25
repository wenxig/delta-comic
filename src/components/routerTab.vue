<script setup lang='ts' generic="T extends {
  name: string,
  title: string
}">
import { TabsInstance } from 'vant'
import { onUnmounted, ref, useTemplateRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const $props = defineProps<{
  items: T[],
  routerBase: string,
  queries?: Record<string, string>
}>()
const $route = useRoute()
const defaultRouter = decodeURI($route.path.replaceAll($props.routerBase + '/', '').split('/')[0])
const select = ref(defaultRouter)
defineSlots<{
  default(arg: { itemName: T }): any
  left(): any
  right(): any
  bottom(): any
}>()
const $router = useRouter()
const tab = useTemplateRef<TabsInstance>('tab')
const beforeChange = async (aim: string) => {
  let queryString = '?'
  for (const key in ($props.queries ?? {})) {
    if (Object.prototype.hasOwnProperty.call(($props.queries ?? {}), key)) {
      const value = ($props.queries ?? {})[key]
      queryString += `${key}=${value}&`
    }
  }
  queryString = queryString.replace(/&$/, '')
  await $router.force.replace(`${$props.routerBase}/${aim.split('/').map(encodeURI).join('/')}${queryString}`)
  return true
}
watch(() => $props.queries, () => {
  beforeChange(select.value)
}, { immediate: true })
watch(() => $props.items, items => {
  if (!items.find(v => v.name.startsWith(select.value))) {
    console.log(select.value, items)
    // beforeChange(items[0].name)
  }
})
const stop = $router.afterEach((to) => {
  if (to.path.startsWith($props.routerBase)) {
    const aim = to.path.replaceAll($props.routerBase + '/', '').split('/')[0]
    if (aim !== select.value) {
      select.value = aim
    }
  }
})
onUnmounted(() => {
  stop()
})
</script>

<template>
  <VanTabs ref="tab" shrink v-model:active="select" :beforeChange class="w-full">
    <template #nav-left>
      <slot name="left"></slot>
    </template>
    <template #nav-right>
      <slot name="right"></slot>
    </template>
    <template #nav-bottom>
      <slot name="bottom"></slot>
    </template>
    <VanTab v-for="item of items" :title="item.title" @click="select = item.name" :name="item.name">

    </VanTab>
  </VanTabs>
</template>