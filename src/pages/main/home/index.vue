<script setup lang='ts'>
import ExtendableSearchBar from '@/components/search/extendableSearchBar.vue'
import symbol from '@/symbol'
import userIcon from '@/assets/images/userIcon.webp'
import { VideogameAssetFilled } from '@vicons/material'
import { Comp, uni } from 'delta-comic-core'
import { isEmpty, random } from 'lodash-es'
import { shallowRef, provide, nextTick, useTemplateRef, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
const $router = useRouter()
const $route = useRoute()
const isShowNavBar = shallowRef(true)
provide(symbol.showMainHomeNavBar, isShowNavBar)

const extendableSearchBar = useTemplateRef('extendableSearchBar')

const toSearchInHideMode = async () => {
  isShowNavBar.value = true
  await nextTick()
  extendableSearchBar.value?.inputEl?.focus()
}

const avatars = computed(() => Array.from(uni.user.User.userBase.values()).filter(v => !!v.avatar).map(v => v.avatar!))
</script>
<template>
  <div class="w-full pt-safe bg-(--van-background-2)"></div>
  <header :class="[isShowNavBar ? 'translate-y-0' : '-translate-y-[calc(var(--safe-area-inset-top)+100%)]']"
    class="h-[54px] duration-200 transition-transform w-full bg-(--van-background-2) flex items-center relative overflow-hidden *:overflow-hidden">
    <div class="!w-[41px] !h-[41px] ml-1">
      <Teleport to="#popups">
        <Comp.Image :src="isEmpty(avatars) ? userIcon : avatars[random(0, avatars.length - 1)]" round
          v-if="!extendableSearchBar?.isSearching" :class="[isShowNavBar ? 'translate-y-0' : '-translate-y-[200%]']"
          class="fixed !w-[41px] !h-[41px] ml-1 top-safe-offset-2 duration-200 transition-transform" />
      </Teleport>
    </div>
    <ExtendableSearchBar ref="extendableSearchBar" />
    <div class="flex justify-evenly font-mono w-[calc(50%-63px)]" v-if="!extendableSearchBar?.isSearching">
      <NIcon color="rgb(156 163 175)" @click="$router.force.push('/game')" size="1.8rem">
        <VideogameAssetFilled />
      </NIcon>
      <VanIcon name="bullhorn-o" color="rgb(156 163 175)" size="1.8rem" />
    </div>
  </header>
  <div class="h-(--van-tabs-line-height) static duration-200 transition-transform"
    :class="[isShowNavBar ? 'translate-y-0' : '-translate-y-[calc(var(--van-tabs-line-height)+var(--van-tabs-padding-bottom))]']">
    <Comp.RouterTab router-base="/main/home" :items="[{
      title: '推荐',
      name: 'random'
    }, {
      title: '排行榜',
      name: 'level'
    }]" />
    <VanIcon name="search" @click="toSearchInHideMode"
      class="!absolute top-1/2 duration-200 transition-transform right-0 -translate-y-1/2 bg-(--van-background-2) shadow rounded-full p-1"
      :class="[isShowNavBar ? 'translate-x-full' : '-translate-x-2']" size="25px" color="var(--van-text-color-2)" />
  </div>
  <div class="w-full duration-200 transition-all  overflow-hidden"
    :class="[isShowNavBar ? 'h-[calc(100%-var(--van-tabs-line-height)-var(--van-tabs-line-height)-var(--van-tabs-padding-bottom)-var(--safe-area-inset-top))] translate-y-0' : '!h-[calc(100%-var(--safe-area-inset-top)-var(--van-tabs-line-height))] -translate-y-[calc(var(--van-tabs-line-height)+var(--van-tabs-padding-bottom))]']">
    <RouterView :key="$route.params.id.toString()" />
  </div>
</template>
