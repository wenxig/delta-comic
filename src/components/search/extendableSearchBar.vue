<script setup lang='ts'>
import { useConfig } from '@/config'
import { useCycleList, useIntervalFn } from '@vueuse/core'
import { isEmpty } from 'lodash-es'
import { useTemplateRef } from 'vue'

const $props = defineProps<{
  placeholders?: string[]
}>()

const placeholder = useCycleList($props.placeholders ?? [])
useIntervalFn(() => placeholder.next(), 4000)

const config = useConfig()
const isSearching = defineModel<boolean>('isSearching', { default: false })
const text = defineModel<string>('text', { default: '' })

const handleSearch = (text: string) => {

}

const inputEl = useTemplateRef('inputEl')

defineExpose({
  inputEl,
  isSearching
})
</script>

<template>
  <div class="w-1/2 ml-3 h-[36px]">
    <div :class="[isSearching ? 'rounded-lg w-[calc(100%-18px)] left-1' : 'rounded-full w-1/2 ml-3 left-[41px]']"
      class="transition-all duration-200 border-solid border absolute !z-1000 border-gray-400 text-gray-400 h-[36px] px-1 flex items-center">
      <VanIcon name="search" color="rgb(156 163 175)" size="1.5rem"
        @click="handleSearch(text || placeholder.state.value)" />
      <SearchTag :text />
      <form action="/" @submit.prevent="handleSearch(text)" class="h-full w-full">
        <input type="search" class="h-full w-full border-none bg-transparent input"
          :class="[config['app.darkMode'] ? '!text-white' : '!text-black']" spellcheck="false"
          @focus="isSearching = true" v-model="text" :placeholder="placeholder.state.value" ref="inputEl" />
        <Motion :initial="{ opacity: 0 }" :animate="{ opacity: !isEmpty(text) ? 1 : 0 }"
          :transition="{ type: 'tween', duration: 0.1 }">
          <VanIcon name="cross" @click="() => { text = ''; isSearching = false }"
            class="z-10 !absolute h-full right-2 !flex items-center top-0 font-bold transition-[transform,_opacity]"
            color="#9ca3af" />
        </Motion>
      </form>
    </div>
  </div>
  <SearchPop source="bika" v-model:show="isSearching" v-model="text" @search="handleSearch(text)" />
</template>