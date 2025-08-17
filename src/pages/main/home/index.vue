<script setup lang='ts'>
import RouterTab from '@/components/routerTab.vue'
import { useConfig } from '@/config'
import { useBikaStore, useJmStore } from '@/stores'
import symbol from '@/symbol'
import { toCn, useSearchMode } from '@/utils/translator'
import { VideogameAssetFilled } from '@vicons/material'
import { useCycleList, useIntervalFn } from '@vueuse/core'
import { isEmpty } from 'lodash-es'
import { nextTick, useTemplateRef } from 'vue'
import { shallowRef, provide } from 'vue'
import { useRouter } from 'vue-router'
const $router = useRouter()
const isShowNavBar = shallowRef(true)
provide(symbol.showMainHomeNavBar, isShowNavBar)
const bikaStore = useBikaStore()
const jmStore = useJmStore()
const config = useConfig()

const hotTag = (useCycleList(() => bikaStore.preload.hotTag.data.value ?? []))
useIntervalFn(() => {
  hotTag.next()
}, 4000)

const searchText = shallowRef('')
const isSearching = shallowRef(false)
const searchMode = useSearchMode(searchText)
const urlText = (str: string) => str.replace(/^[\@\#]+/g, '')
const handleSearch = (value: string) => {
  $router.force.push(`/search?keyword=${encodeURIComponent(urlText(value))}&mode=${searchMode.value}`)
  isSearching.value = false
}
const inputEl = useTemplateRef('inputEl')
const toSearchInHideMode = async () => {
  isShowNavBar.value = true
  await nextTick()
  inputEl.value?.focus()
}

</script>
<template>
  <header :class="[isShowNavBar ? 'translate-y-0' : '-translate-y-full']"
    class="h-[54px] duration-200 transition-transform w-full bg-(--van-background-2) flex items-center relative overflow-hidden *:overflow-hidden">
    <div class="!w-[41px] !h-[41px] ml-1">
      <Teleport to="#popups">
        <Image :src="bikaStore.user.profile.data.value?.$avatar" round v-if="!isSearching"
          class="fixed !w-[41px] !h-[41px] ml-1 top-2 duration-200 transition-transform"
          :class="[isShowNavBar ? 'translate-y-0' : '-translate-y-[200%]']" />
      </Teleport>
    </div>
    <div class="w-1/2 ml-3 h-[36px]"></div>
    <div :class="[!isSearching ? 'rounded-full w-1/2 ml-3 left-[41px]' : 'rounded-lg w-[calc(100%-18px)] left-1']"
      class="transition-all duration-200 border-solid border absolute !z-1000 border-gray-400 text-gray-400 h-[36px] px-1 flex items-center">
      <VanIcon name="search" color="rgb(156 163 175)" size="1.5rem"
        @click="handleSearch((searchText || hotTag.state.value).toString())" />
      <SearchTag :text="searchText" />
      <form action="/" @submit.prevent="handleSearch(searchText)" class="h-full w-full">
        <input type="search" class="h-full w-full border-none bg-transparent input"
          :class="[config['app.darkMode'] ? '!text-white' : '!text-black']" spellcheck="false"
          @focus="isSearching = true" v-model="searchText" :placeholder="hotTag.state.value?.toString()"
          ref="inputEl" />
        <Transition leave-from-class="translate-x-[0%] opacity-100" leave-active-class="translate-x-[30%] opacity-0"
          leave-to-class="translate-x-[30%] opacity-0" enter-from-class="translate-x-[30%] opacity-0"
          enter-active-class="translate-x-[0%] opacity-100" enter-to-class="translate-x-[0%] opacity-100">
          <VanIcon name="cross"
            class="z-10 absolute h-full right-2 flex items-center top-0 font-bold transition-[transform,_opacity]"
            color="#9ca3af" v-if="!isEmpty(searchText)"></VanIcon>
          <div v-else></div>
        </Transition>
      </form>
    </div>
    <div class="flex justify-evenly font-mono w-[calc(50%-63px)]" v-if="!isSearching">
      <NIcon color="rgb(156 163 175)" @click="$router.force.push('/game')" size="1.8rem">
        <VideogameAssetFilled />
      </NIcon>
      <VanIcon name="bullhorn-o" color="rgb(156 163 175)" size="1.8rem" />
    </div>
    <SearchPop v-model:show="isSearching" v-model="searchText" @search="handleSearch(searchText)" />
  </header>
  <div class="h-[44px] static duration-200 transition-transform"
    :class="[isShowNavBar ? 'translate-y-0' : '-translate-y-[54px]']">
    <RouterTab router-base="/main/home" :items="[{
      title: '推荐',
      name: 'random'
    }, {
      title: '排行榜',
      name: 'level'
    }, {
      title: '每周推荐',
      name: 'week'
    }, ...(bikaStore.preload.collections.data.value ?? []).map(v => ({
      title: toCn(v.title),
      name: v.title
    })), ...(jmStore.preload.promote.data.value ?? []).map(v => ({
      title: toCn(v.title),
      name: v.id.toString()
    }))]" />
    <VanIcon name="search" @click="toSearchInHideMode"
      class="!absolute top-1/2 duration-200 transition-transform right-0 -translate-y-1/2 bg-(--van-background-2) shadow rounded-full p-1"
      :class="[isShowNavBar ? 'translate-x-full' : '-translate-x-2']" size="25px" color="var(--van-text-color-2)" />
  </div>
  <div class="w-full duration-200 transition-all  overflow-hidden"
    :class="[isShowNavBar ? 'h-[calc(100%-98px)] translate-y-0' : '!h-[calc(100%-44px)] -translate-y-[54px]']">
    <RouterView :key="$route.params.id.toString()" />
  </div>
</template>

<style scoped>
.input::-webkit-search-cancel-button {
  display: none;
}
</style>