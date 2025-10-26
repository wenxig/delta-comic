<script setup lang='ts'>
import { Comp, Store, uni, Utils } from 'delta-comic-core'
import { computed, markRaw } from 'vue'
import { useRoute } from 'vue-router'

const $route = useRoute()
const plugin = computed(() => $route.query.plugin?.toString() ?? '')
const sourceList = computed(() => uni.content.ContentPage.getLevelboard(plugin.value))
const temp = Store.useTemp().$apply('level', () => ({
  name: sourceList.value?.[0].name ?? '',
  list: markRaw(new Map<string, Utils.data.RStream<uni.item.Item> | Utils.data.RPromiseContent<any, uni.item.Item[]>>())
}))
const source = computed(() => {
  if (!temp.list.has(`${plugin.value}:${temp.name}`)) {
    const s = sourceList.value?.find(v => v.name == temp.name)?.content()
    if (!s) return {
      data: Utils.data.PromiseContent.fromPromise(Promise.reject(`Can not found named: "${temp.name}" in ${plugin.value}`)),
      isEnd: true
    }
    temp.list.set(`${plugin.value}:${temp.name}`, s)
  }
  const s = temp.list.get(`${plugin.value}:${temp.name}`)!
  return Utils.data.Stream.isStream(s) ? s : {
    data: s,
    isEnd: true
  }
})

const getItemCard = (item: uni.item.Item) => uni.content.ContentPage.getItemCard(item.contentType)

const getColor = (index: number) => {
  if (index == 0) {
    return 'rgb(255,215,0)'
  }
  if (index == 1) {
    return 'rgb(192,192,192)' // silver
  }
  if (index == 2) {
    return 'rgb(205,127,50)' // bronze
  }
  if (index < 9) {
    return 'var(--p-color)'
  }
  return 'transparent'
}
</script>

<template>
  <div class="size-full">
    <VanNavBar title="排行榜" left-arrow @click-left="$router.back()">
      <template #right>
        <NPopselect :options="Array.from(uni.content.ContentPage.levelboard.entries()).map(([plugin, sources]) => ({
          type: 'group',
          label: plugin,
          children: sources.map(s => ({
            label: s.name,
            value: s.name
          }))
        }))" v-model:value="temp.name" placement="bottom-end" size="large">
          <NButton text>
            <span class="text-(--nui-primary-color) text-xs">
              {{ plugin }}:{{ temp.name }}
            </span>
          </NButton>
        </NPopselect>
      </template>
    </VanNavBar>
    <div class="w-full h-[calc(100%-46px)]">
      <Comp.List v-if="source" :source :item-height="140" v-slot="{ data: { item, index }, height }" class="!size-full">
        <div :style="{ height: `${height}px` }" class="w-full overflow-hidden relative">
          <component :is="getItemCard(item)" :item :style="{ height: `${height}px` }"
            @click="Utils.eventBus.SharedFunction.call('routeToContent', item.contentType, item.id, item.thisEp.index, item)" />
          <div :style="{ '--color': getColor(index) }"
            class="absolute bottom-0 translate-y-1/4 right-0 translate-x-1/6 text-(--color) z-0 text-[20vw] italic font-bold opacity-20">
            #{{ index+1 }}</div>
        </div>
      </Comp.List>
    </div>
  </div>
</template>