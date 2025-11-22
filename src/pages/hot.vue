<script setup lang='ts'>
import { usePluginStore } from '@/plugin/store'
import { Comp, Store, uni, Utils } from 'delta-comic-core'
import { computed, markRaw, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const $router = useRouter()
const $route = useRoute()
const plugin = computed(() => $route.query.plugin?.toString() ?? '')
const sourceList = computed(() => uni.content.ContentPage.getLevelboard(plugin.value))
const temp = Store.useTemp().$apply('level', () => ({
  pluginAndName: `${plugin.value}:${$route.query.dfSel ?? sourceList.value?.[0].name}`,
  list: markRaw(new Map<string, Utils.data.RStream<uni.item.Item> | Utils.data.RPromiseContent<any, uni.item.Item[]>>())
}))
watch(() => temp.pluginAndName, (pan, oldPan) => {
  const [plugin, select] = pan.split(':')
  const [oPlugin] = oldPan.split(':')
  if (plugin != oPlugin)
    return $router.force.replace(`/hot?plugin=${plugin}&dfSel=${select}`)
})
const source = computed(() => {
  if (!temp.list.has(temp.pluginAndName)) {
    const [plugin, name] = temp.pluginAndName.split(':')
    const s = sourceList.value?.find(v => v.name == name)?.content()
    if (!s) return {
      data: Utils.data.PromiseContent.fromPromise(Promise.reject(`Can not found named: "${name}" in ${plugin}`)),
      isEnd: true
    }
    temp.list.set(temp.pluginAndName, s)
  }
  const s = temp.list.get(temp.pluginAndName)!
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
const pluginStore = usePluginStore()
</script>

<template>
  <div class="size-full">
    <VanNavBar title="排行榜" left-arrow @click-left="$router.back()" class="pt-safe">
      <template #right>
        <NPopselect :options="Array.from(uni.content.ContentPage.levelboard.entries()).map(([plugin, sources]) => ({
          type: 'group',
          label: plugin,
          children: sources.map(s => ({
            label: s.name,
            value: s.name
          }))
        }))" v-model:value="temp.pluginAndName" placement="bottom-end" size="large">
          <NButton text>
            <span class="text-(--nui-primary-color) text-xs">
              <Comp.Var :value="temp.pluginAndName.split(':')" v-slot="{ value: [plugin, name] }">
                {{ pluginStore.$getPluginDisplayName(plugin) }}:{{ name }}
              </Comp.Var>
            </span>
          </NButton>
        </NPopselect>
      </template>
    </VanNavBar>
    <div class="w-full h-[calc(100%-46px)]">
      <Comp.List v-if="source" :source :item-height="140" v-slot="{ data: { item, index }, height }" class="!size-full">
        <div :style="{ height: `${height}px` }" class="w-full overflow-hidden relative">
          <component :is="getItemCard(item)" :item :style="{ height: `${height}px` }" />
          <div :style="{ '--color': getColor(index) }"
            class="absolute bottom-0 translate-y-1/4 right-0 translate-x-1/6 text-(--color) z-0 text-[20vw] italic font-bold opacity-20">
            #{{ index + 1 }}</div>
        </div>
      </Comp.List>
    </div>
  </div>
</template>