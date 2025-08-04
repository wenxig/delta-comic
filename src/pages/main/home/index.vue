<script setup lang='ts'>
import RouterTab from '@/components/routerTab.vue'
import symbol from '@/symbol'
import { VideogameAssetFilled } from '@vicons/material'
import { shallowRef, provide } from 'vue'

const isShowNavBar = shallowRef(true)
provide(symbol.showNavBar, isShowNavBar)
</script>
<template>
  <header :class="[isShowNavBar ? 'translate-y-0' : '-translate-y-full']"
    class="h-[54px] duration-200 transition-transform w-full bg-(--van-background-2) flex items-center relative overflow-hidden *:overflow-hidden">
    <div class="!w-[41px] !h-[41px] ml-1">
      <Teleport to="#popups">
        <Image round v-if="!false" class="fixed !w-[41px] !h-[41px] ml-1 top-2 duration-200 transition-transform"
          :class="[isShowNavBar ? 'translate-y-0' : '-translate-y-[200%]']" />
      </Teleport>
    </div>
    <div class="w-1/2 ml-3 h-[36px]"></div>
    <div :class="[!false ? 'rounded-full w-1/2 ml-3 left-[41px]' : 'rounded-lg w-[calc(100%-18px)] left-1']"
      class="transition-all duration-200 border-solid border absolute border-gray-400 text-gray-400 h-[36px] px-1 flex items-center">
      <VanIcon name="search" color="rgb(156 163 175)" size="1.5rem" />
      <form action="/" class="h-full w-full">
        <input type="search" class="h-full w-full border-none bg-transparent input" spellcheck="false" />
        <Transition leave-from-class="translate-x-[0%] opacity-100" leave-active-class="translate-x-[30%] opacity-0"
          leave-to-class="translate-x-[30%] opacity-0" enter-from-class="translate-x-[30%] opacity-0"
          enter-active-class="translate-x-[0%] opacity-100" enter-to-class="translate-x-[0%] opacity-100">
          <VanIcon name="cross" class="z-10 absolute h-full right-2 flex items-center top-0 font-bold transition-all"
            color="#9ca3af"></VanIcon>
        </Transition>
      </form>
    </div>
    <div class="flex justify-evenly w-[calc(50%-63px)]" v-if="!false">
      <NIcon color="rgb(156 163 175)" @click="$router.force.push('/game')" size="1.8rem">
        <VideogameAssetFilled />
      </NIcon>
      <VanIcon name="bullhorn-o" color="rgb(156 163 175)" size="1.8rem" />
    </div>
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
      title: '分区',
      name: 'find'
    }]" />
    <VanIcon name="search" class="!absolute top-1/2 duration-200 transition-transform right-0 -translate-y-1/2"
      :class="[isShowNavBar ? 'translate-x-full' : '-translate-x-2']" size="25px" color="var(--van-text-color-2)" />
  </div>
  <div class="w-full duration-200 transition-all  overflow-hidden"
    :class="[isShowNavBar ? 'h-[calc(100%-98px)] translate-y-0' : '!h-[calc(100%-44px)] -translate-y-[54px]']">
    <RouterView v-slot="{ Component }">
      <component :is="Component" />
    </RouterView>
  </div>
</template>

<style scoped>
.input::-webkit-search-cancel-button {
  display: none;
}
</style>