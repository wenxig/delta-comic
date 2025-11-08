<script setup lang='ts'>
import symbol from '@/symbol'
import { useLocalStorage } from '@vueuse/core'
import { PluginConfigSearch, PluginConfigSearchMethod, Utils } from 'delta-comic-core'
import { isEmpty } from 'es-toolkit/compat'
import { motion } from 'motion-v'
import { shallowRef } from 'vue'
import { useRouter } from 'vue-router'
const $props = defineProps<{
  source: string
}>()

const isSearching = defineModel<boolean>('isSearching', { required: true })
const searchText = defineModel<string>('searchText', { required: true })

const $router = useRouter()
const handleSearch = (text: string) =>
  Utils.eventBus.SharedFunction.call('routeToSearch', text, $props.source)

const [zIndex] = Utils.layout.useZIndex(isSearching)

const history = useLocalStorage(symbol.searchFilterHistory, [])

const thinkList = shallowRef<Awaited<ReturnType<PluginConfigSearchMethod['getAutoComplete']>>[]>([])
</script>

<template>

  <form action="/" @submit.prevent :class="[{ 'fixed top-0 left-0 w-screen z-1000': false }]">
    <VanSearch ref="search" :show-action="true" v-model="searchText" placeholder="请输入搜索内容"
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
        :animate="{ opacity: 0.5 }" class="bg-(--van-black) w-screen h-screen fixed top-[54px] left-0">
      </motion.div>
      <motion.div :style="{ zIndex }" :initial="{ height: 0, opacity: 0.3 }" :animate="{ height: 'auto', opacity: 1 }"
        :exit="{ height: 0, opacity: 0.3 }" v-if="isSearching" layout :transition="{ duration: 0.1 }"
        class="w-full flex flex-wrap max-h-[60vh] justify-evenly transition-all overflow-hidden bg-(--van-background-2) rounded-b-3xl pb-3 pt-1 fixed top-[54px]">
        <VanList class="w-full">
          <template v-if="!isEmpty(history)">
            <VanCell v-for="filter of history" :title="filter" @click="searchText = filter"
              class="van-haptics-feedback w-full" />
          </template>
        </VanList>
      </motion.div>
    </AnimatePresence>
  </Teleport>
</template>