<script setup lang='ts'>
import { subscribeDb, SubscribeItem } from '@/db/subscribe'
import { usePluginStore } from '@/plugin/store'
import { useLiveQueryRef } from '@/utils/db'
import { ArrowForwardIosRound, CloseRound } from '@vicons/material'
import { Comp, Store, uni, Utils } from 'delta-comic-core'
import { isString } from 'es-toolkit'
import { computed, shallowRef } from 'vue'
import List from './list.vue'
import { motion } from 'motion-v'
const isOnAllPage = shallowRef(true)
const pluginStore = usePluginStore()
const subscribe = useLiveQueryRef(() => subscribeDb.all.toArray(), [])

const select = shallowRef<string>()
const selectItem = computed(() => subscribe.value.find(v => v.key == select.value))
const temp = Store.useTemp().$applyRaw('subscribeList', () => new Map<string, Utils.data.RStream<uni.item.Item>>())
const getSource = (si: SubscribeItem) => {
  // select.value ? (temp[select.value.key] ??=   []) : undefined
  if (temp.has(si.key)) return temp.get(si.key)!
  const [plugin] = si.key.split(':')
  if (si.type == 'author') {
    const type = si.author.subscribe!
    const sub = pluginStore.plugins.get(plugin)?.subscribe?.[type]
    if (!sub) throw new Error(`can not found subscribe config which type:${type}, plugin:${plugin}`)
    const stream = sub.getListStream(si.author)
    temp.set(si.key, stream)
    return stream
  }
  throw new Error('not impl')
}

const unsubscribe = (si: SubscribeItem) => {
  select.value = undefined
  return subscribeDb.$remove(si)
}
</script>

<template>
  <div class="!size-full flex flex-col relative">
    <div class="w-full h-fit transition-all will-change-transform"
      :class="[!!select ? '-translate-y-1/3 opacity-0' : 'translate-y-0 opacity-100']">
      <!-- nav -->
      <div
        class="w-full pt-safe relative flex justify-center h-12 text-lg font-semibold items-end van-hairline--bottom bg-(--van-background-2)">
        <span class="pb-1">关注</span>
      </div>
      <!-- tab -->
      <div class="w-full text-nowrap flex justify-around bg-(--van-background-2) h-fit py-1">
        <NButton tertiary :type="isOnAllPage ? 'primary' : 'tertiary'" size="tiny" class="!w-[calc(50%-5px)]"
          @click="isOnAllPage = true">
          全部
        </NButton>
        <NButton tertiary :type="isOnAllPage ? 'tertiary' : 'primary'" size="tiny" class="!w-[calc(50%-5px)]"
          @click="isOnAllPage = false">
          追更
        </NButton>
      </div>
      <!-- more -->
      <div class="w-full text-nowrap flex items-center bg-(--van-background-2) pb-3 pt-3 relative">
        <div class="font-semibold ml-3 h-fit">最常访问</div>
        <div class="flex items-center text-(--van-text-color-2) absolute right-3 !text-xs top-3">
          更多
          <NIcon>
            <ArrowForwardIosRound />
          </NIcon>
        </div>
      </div>
      <!-- authors -->
      <div
        class="w-full h-fit overflow-y-hidden overflow-x-auto scrollbar py-1 bg-(--van-background-2) flex gap-1 px-1">
        <div v-for="sub of subscribe" class="h-full flex flex-col w-fit items-center justify-around"
          @click="select = sub.key">
          <template v-if="sub.type == 'author'">
            <div class="size-12 rounded-full flex items-center justify-center bg-gray-200"
              v-if="isString(sub.author.icon)">
              <NIcon color="var(--p-color)" size="calc(var(--spacing) * 6.5)">
                <component :is="uni.item.Item.getAuthorIcon(sub.author.$$plugin, sub.author.icon)" />
              </NIcon>
            </div>
            <Comp.Image class="size-12 shrink-0 aspect-square" v-else :src="uni.image.Image.create(sub.author.icon)"
              round fit="cover" />
            <div class="text-wrap w-18 !text-xs mt-1 text-center !text-(--van-text-color-2) van-multi-ellipsis--l2">
              {{ sub.author.label }}
            </div>
          </template>
        </div>
      </div>
    </div>
    <!-- list -->
    <AnimatePresence v-if="selectItem?.type == 'author'">
      <div class="absolute top-0 left-0 h-[60px] w-full" @click="select = undefined">
        <template v-for="sub of subscribe">
          <motion.div v-if="sub.key == select" :initial="{ scale: '80%', translateX: '-50%', opacity: 0 }"
            :exit="{ scale: '80%', translateX: '-50%', opacity: 0 }"
            :animate="{ scale: '100%', translateX: '0%', opacity: 1 }"
            class="absolute top-1 h-[calc(60px-(var(--spacing)*2))] max-w-[calc(100%-8px)] text-nowrap van-ellipsis left-1 rounded-2xl bg-(--van-background-2) w-fit flex px-3 gap-2 items-center">
            <div class="size-10 rounded-full flex items-center justify-center bg-gray-200 aspect-square"
              v-if="isString(selectItem.author.icon)">
              <NIcon color="var(--p-color)" size="calc(var(--spacing) * 6.5)">
                <component :is="uni.item.Item.getAuthorIcon(selectItem.author.$$plugin, selectItem.author.icon)" />
              </NIcon>
            </div>
            <Comp.Image class="size-10 shrink-0 aspect-square" v-else
              :src="uni.image.Image.create(selectItem.author.icon)" round fit="cover" />
            <div class="text-lg text-(--p-color) font-semibold">{{ selectItem.author.label }}</div>
          </motion.div>
        </template>
      </div>
      <motion.div class="absolute top-[60px] left-0 w-full h-[calc(100%-60px)]" v-if="selectItem"
        :initial="{ translateY: '-30px', opacity: 0 }" :exit="{ translateY: '-30px', opacity: 0 }"
        :animate="{ translateY: '0px', opacity: 1 }" drag="y"
        :dragConstraints="{ top: 0, right: 0, bottom: 0, left: 0 }"
        :dragTransition="{ bounceStiffness: 500, bounceDamping: 15 }"
        @drag-end="(_, info) => (info.offset.y > 100) && (select = undefined)">
        <VanTabs swipeable :show-header="false" class="!size-full *:!size-full *:*:!size-full *:*:*:!size-full"
          v-model:active="select">
          <VanTab class="!size-full *:!size-full" v-for="author of subscribe.filter(v => v.type == 'author')"
            :name="author.key">
            <div
              class="w-full h-[40px] font-semibold pl-3 text-base flex items-center van-hairline--bottom bg-(--van-background-2) relative rounded-t-2xl">
              {{ author.author.label }}的动态
              <NIcon size="25px" color="var(--van-text-color-3)" class="!absolute right-1" @click="select = undefined">
                <CloseRound />
              </NIcon>
            </div>
            <button @pointerdown.stop class="w-full h-[calc(100%-40px)] overflow-hidden">
              <List :source="getSource(author)" @unsubscribe="unsubscribe(author)" class="size-full" />
            </button>
          </VanTab>
        </VanTabs>
      </motion.div>
    </AnimatePresence>
  </div>
</template>
<style scoped lang='css'>
.scrollbar::-webkit-scrollbar {
  display: none;
}

.scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
</style>