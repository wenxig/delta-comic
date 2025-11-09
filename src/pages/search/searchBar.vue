<script setup lang='ts'>
import { usePluginStore } from '@/plugin/store'
import symbol from '@/symbol'
import { useLocalStorage } from '@vueuse/core'
import { PluginConfigSearchMethod, Utils } from 'delta-comic-core'
import { uniq } from 'es-toolkit'
import { isEmpty } from 'es-toolkit/compat'
import { motion } from 'motion-v'
import { computed, shallowRef, watch } from 'vue'
import { useRouter } from 'vue-router'
const $props = defineProps<{
  source: string
}>()

const isSearching = shallowRef(false)
const [zIndex] = Utils.layout.useZIndex(isSearching)

const searchText = defineModel<string>('searchText', { required: true })
const source = computed(() => {
  const [plugin, method] = ($props.source).split(':')
  return {
    plugin,
    method
  }
})

const $router = useRouter()
const history = useLocalStorage(symbol.searchFilterHistory, new Array<string>())
const handleSearch = (text: string) => {
  history.value = uniq([text, ...history.value])
  return Utils.eventBus.SharedFunction.call('routeToSearch', text)
}

const thinkList = shallowRef<Awaited<ReturnType<PluginConfigSearchMethod['getAutoComplete']>>>([])
const pluginStore = usePluginStore()
const thinkListAbort = new Utils.request.SmartAbortController()
watch([searchText, source], async ([searchText, { method, plugin }], _, onCleanup) => {
  console.log('[thinkList]', searchText)
  onCleanup(() => thinkListAbort.abort())
  if (isEmpty(searchText)) return thinkList.value = history.value.map(v => ({ text: v, value: v }))
  const source = pluginStore.plugins.get(plugin)?.search?.methods?.[method]
  if (!source) return thinkList.value = history.value.map(v => ({ text: v, value: v }))
  try {
    thinkList.value = await source.getAutoComplete(searchText, thinkListAbort.signal)
    console.log('[thinkList]', thinkList.value)
  } catch {
    thinkList.value = []
  }
}, { immediate: true })
</script>

<template>

  <form action="/" @submit.prevent :class="[{ 'fixed top-0 left-0 w-screen z-1000': isSearching }]">
    <VanSearch ref="search" :show-action="true" v-model="searchText" placeholder="请输入搜索内容" @focus="isSearching = true"
      @search="handleSearch(searchText)" @click-left-icon="handleSearch(searchText)" @cancel="$router.back()"
      autocomplete="off">
      <template #left-icon>
        <div class="inline-flex items-center justify-center h-full translate-y-[1]">
          <VanIcon name="search" size="1.2rem" />
        </div>
      </template>
    </VanSearch>
  </form>

  <Teleport to="#popups">
    <AnimatePresence>
      <motion.div @click="isSearching = false" v-if="isSearching" :style="{ zIndex }" :initial="{ opacity: 0 }"
        :animate="{ opacity: 0.5 }" :exit="{ opacity: 0 }"
        class="bg-(--van-black) w-screen h-screen fixed top-[54px] left-0">
      </motion.div>
      <motion.div :style="{ zIndex }" :initial="{ height: 0, opacity: 0.3 }" :animate="{ height: 'auto', opacity: 1 }"
        :exit="{ height: 0, opacity: 0.3 }" v-if="isSearching" layout :transition="{ duration: 0.1 }"
        class="w-full flex flex-wrap max-h-[60vh] justify-evenly transition-all overflow-hidden bg-(--van-background-2) rounded-b-3xl pb-3 pt-1 fixed top-[54px]">
        <VanCellGroup class="w-full">
          <template v-if="!isEmpty(thinkList)">
            <template v-for="think of thinkList">
              <VanCell v-if="'text' in think" :title="think.text" @click="searchText = think.value" class="van-haptics-feedback w-full" />
              <component v-else :is="think" />
            </template>
          </template>
        </VanCellGroup>
      </motion.div>
    </AnimatePresence>
  </Teleport>
</template>