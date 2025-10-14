<script setup lang='ts'>
import { Comp, uni } from 'delta-comic-core'
import { entries } from 'lodash-es'
import { NSelect } from 'naive-ui'
import { computed, shallowRef } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()
const name = computed(() => route.path.match(/(?<=\/main\/)\w+(?=\/)?/g)?.[0])

const showForkSelect = shallowRef(false)
</script>

<template>
  <div class="w-full overflow-hidden h-[calc(100%-var(--van-tabbar-height))]">
    <RouterView />
  </div>
  <VanTabbar class="fixed bottom-0 transition-[opacity] opacity-100 w-full items-center" :model-value="name">
    <VanTabbarItem name="home" to="/main/home" icon="home-o">首页</VanTabbarItem>
    <VanTabbarItem name="favourite" to="/main/home" icon="home-o">关注</VanTabbarItem>
    <NButton class="!size-10 **:!text-2xl !rounded-2xl !mx-3" type="primary" @click="showForkSelect = true">
      <template #icon>
        <NIcon>
          <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px"
            y="0px" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve">
            <path d="M352,96c-38.6,0-70,31.4-70,70c0,33.4,23.7,61.9,55.9,68.5c-1.2,19.1-10.3,29.3-27,42.2c-20.4,15.7-46.7,20-65.3,23.4
	c-40.7,7.4-62.9,27-72.5,40V170.8c15-2.8,28.7-10.5,39-21.9c11.6-12.9,18-29.5,18-46.9c0-38.6-31.4-70-70-70s-70,31.4-70,70
	c0,17,6.2,33.3,17.3,46.1c9.9,11.3,23.1,19.1,37.7,22.3v171.3c-14.5,3.2-27.8,11-37.7,22.3C96.2,376.7,90,393,90,410
	c0,38.6,31.4,70,70,70s70-31.4,70-70c0-23.4-11.6-44.9-30.7-57.9c8.6-9.7,24.5-19.6,51.1-24.4c21.6-3.9,52.6-9.6,77.4-28.8
	c23.6-18.2,36.7-36.5,38-64.3c32.3-6.5,56.1-35.1,56.1-68.6C422,127.4,390.6,96,352,96z M118,102c0-23.2,18.8-42,42-42
	s42,18.8,42,42s-18.8,42-42,42S118,125.2,118,102z M202,410c0,23.2-18.8,42-42,42s-42-18.8-42-42s18.8-42,42-42S202,386.8,202,410z
	 M352,208c-23.2,0-42-18.8-42-42s18.8-42,42-42c23.2,0,42,18.8,42,42S375.2,208,352,208z"></path>
          </svg>
        </NIcon>
      </template>
    </NButton>
    <VanTabbarItem name="buy" to="/main/home" icon="home-o">会员购</VanTabbarItem>
    <VanTabbarItem name="user" to="/main/user" icon="user-o">我的</VanTabbarItem>
  </VanTabbar>
  <Comp.Popup v-model:show="showForkSelect" position="bottom" overlay round>
    <div class="w-full min-h-60 px-2">
      <div class="pt-3 !pl-5 text-2xl mb-2">图源更改</div>
      <div v-for="[plugin, value] in entries(Object.groupBy(Array.from(uni.image.Image.fork.entries()).map(([key, forks]) => {
        const [plugin, namespace] = key.split(':')
        return {
          plugin,
          namespace,
          forks,
          active: uni.image.Image.activeFork.get(key)!,
          key
        }
      }), v => v.plugin))">
        <div class="text-lg text-(--p-color)">{{ plugin }}</div>
        <div v-for="v in value!">
          <div class="text-[14px] pl-1 -mt-1">{{ v.namespace }}</div>
          <NSelect :options="v.forks.map(v => ({ value: v, label: v }))" :value="v.active"
            @update:value="url => uni.image.Image.activeFork.set(v.key, url)" />
        </div>
      </div>
    </div>
  </Comp.Popup>
</template>