<script setup lang='ts'>
import { uni } from 'delta-comic-core'
import LevelIcon from './levelIcon.vue'
import { isEmpty } from 'es-toolkit/compat';


</script>

<template>
  <div class="w-full h-fit overflow-y-hidden overflow-x-auto scrollbar py-1 bg-(--van-background-2)">
    <div class="h-full flex flex-col w-fit mx-4 items-center justify-around" v-for="btn of [isEmpty(uni.content.ContentPage.levelboard) ? undefined : {
      bgColor: '#ff9212',
      name: '排行榜',
      icon: LevelIcon,
      onClick() {
        const first = uni.content.ContentPage.levelboard.keys().next().value!
        return $router.force.push(`/hot?plugin=${first}`)
      }
    }, ...Array.from(uni.content.ContentPage.topButton.values()).flat()].filter(v => !!v)">
      <button class="size-12  rounded-full flex items-center justify-center" :style="{ backgroundColor: btn.bgColor }"
        @click="btn.onClick">
        <NIcon color="white" size="calc(var(--spacing) * 6.5)">
          <component :is="btn.icon" />
        </NIcon>
      </button>
      <div class="!text-[13px]">{{ btn.name }}</div>
    </div>
  </div>
</template>
<style scoped lang='scss'>
.scrollbar::-webkit-scrollbar {
  display: none;
}

.scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
</style>