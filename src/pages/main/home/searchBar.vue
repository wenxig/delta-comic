<script setup lang='ts'>
import symbol from '@/symbol'
import { useLocalStorage } from '@vueuse/core'
import { Utils } from 'delta-comic-core'
import { uniq } from 'es-toolkit'
import { isEmpty } from 'es-toolkit/compat'
import { motion } from 'motion-v'
import { useTemplateRef } from 'vue'

const isSearching = defineModel<boolean>('isSearching', { default: false })
const text = defineModel<string>('text', { default: '' })

const handleSearch = (text: string) => {
  history.value = uniq([text, ...history.value])
  return Utils.eventBus.SharedFunction.call('routeToSearch', text)
}

const inputEl = useTemplateRef('inputEl')

defineExpose({
  inputEl,
  isSearching
})

const [zIndex] = Utils.layout.useZIndex(isSearching)

const history = useLocalStorage(symbol.searchFilterHistory, new Array<string>())
</script>

<template>
  <div class="w-1/2 ml-3 h-[36px]">
    <div :class="[isSearching ? 'rounded-lg w-[calc(100%-18px)] left-1' : 'rounded-full w-1/2 ml-3 left-[41px]']"
      class="transition-all duration-200 border-solid border absolute !z-1000 border-gray-400 text-gray-400 h-[36px] px-1 flex items-center">
      <VanIcon name="search" color="rgb(156 163 175)" size="1.5rem" @click="handleSearch(text)" />
      <form action="/" @submit.prevent="handleSearch(text)" class="h-full w-full">
        <input type="search" class="h-full w-full border-none bg-transparent !text-(--van-text-color)"
          spellcheck="false" @focus="isSearching = true" v-model="text" placeholder="搜索" ref="inputEl" />
        <Motion :initial="{ opacity: 0 }" :animate="{ opacity: !isEmpty(text) ? 1 : 0 }"
          :transition="{ type: 'tween', duration: 0.1 }">
          <VanIcon name="cross" @click="() => { text = ''; isSearching = false }"
            class="z-10 !absolute h-full right-2 !flex items-center top-0 font-bold transition-[transform,_opacity]"
            color="#9ca3af" />
        </Motion>
      </form>
    </div>
  </div>

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
            <VanCell v-for="filter of history" :title="filter" @click="handleSearch(filter)"
              class="van-haptics-feedback w-full" />
          </template>
        </VanList>
      </motion.div>
    </AnimatePresence>
  </Teleport>
</template>