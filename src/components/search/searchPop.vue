<script setup lang='ts'>
import { isEmpty } from 'lodash-es'
import { shallowRef, watch } from 'vue'
import { motion } from 'motion-v'
import { uni } from 'delta-comic-core'
import { Utils } from 'delta-comic-core'
const inputText = defineModel<string>({ required: true })
const show = defineModel<boolean>('show', { required: true })
defineEmits<{
  search: []
}>()
const [zIndex] = Utils.layout.useZIndex(show)
const thinkList = shallowRef<uni.item.Item[] | null>(null)
watch(inputText, () => thinkList.value = null)

</script>

<template>
  <Teleport to="#popups">
    <AnimatePresence>
      <motion.div @click="show = false" v-if="show" :style="{ zIndex }" :initial="{ opacity: 0 }"
        :animate="{ opacity: 0.5 }"
        class="bg-(--van-black) w-screen h-screen fixed top-[calc(var(--van-tabs-line-height)+var(--van-tabs-padding-bottom)+var(--safe-area-inset-top))] left-0">
      </motion.div>
      <motion.div :style="{ zIndex }" :initial="{ height: 0, opacity: 0.3 }" :animate="{ height: 'auto', opacity: 1 }"
        :exit="{ height: 0, opacity: 0.3 }" v-if="show" layout :transition="{ duration: 0.1 }"
        class="w-full flex flex-wrap max-h-[60vh] justify-evenly transition-all overflow-hidden bg-(--van-background-2) rounded-b-3xl pb-3 pt-1 fixed top-[calc(var(--van-tabs-line-height)+var(--van-tabs-padding-bottom)+var(--safe-area-inset-top))]">
        <template v-if="isEmpty(inputText)">
          <!-- <template v-if="!isEmpty(app.searchHistory)">
          <span class="text-xl text-(--van-primary-color) font-bold w-full pl-3 van-hairline--top">历史搜索</span>
          <div class="w-full h-auto flex flex-wrap pl-1 mb-1">
            <van-tag type="primary" v-for="(tag, index) of app.searchHistory.toReversed().slice(0, 12)" size="large"
              class="m-1 text-nowrap van-haptics-feedback" plain :key="index"
              @click="() => { inputText = tag.toString(); $emit('search') }">{{ tag }}</van-tag>
          </div>
        </template> -->
        </template>
        <VanList v-else class="w-full">
          <template v-if="thinkList == null">
            <div class="w-full flex justify-center items-center">
              <VanLoading size="24px">加载中...</VanLoading>
            </div>
          </template>
          <template v-else-if="!isEmpty(thinkList)">
            <VanCell v-for="think of thinkList" :title="think.title" :value="think.author.join(',&nbsp;')" @click="() => {
              inputText = think.title
              $emit('search')
            }" class="van-haptics-feedback w-full" />
          </template>
          <div v-else>
            <NEmpty description="无结果" class="w-full my-1" />
          </div>
        </VanList>
      </motion.div>
    </AnimatePresence>
  </Teleport>
</template>
