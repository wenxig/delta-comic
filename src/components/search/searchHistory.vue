<script setup lang='ts'>
import { Utils } from 'delta-comic-core'
import { isEmpty, uniq } from 'lodash-es'
import { motion } from 'motion-v'
const histories = defineModel<string[]>({ required: true })
const isSearching = defineModel<boolean>({ required: true })
const searchText = defineModel<string>({ required: true })
const [zIndex] = Utils.layout.useZIndex(isSearching)
defineExpose({
  addHistory(text: string){
    histories.value = uniq([text, ...histories.value])
  }
})
</script>

<template>
  <Teleport to="#popups">
    <AnimatePresence>
      <motion.div @click="isSearching = false" v-if="isSearching" :style="{ zIndex }" :initial="{ opacity: 0 }"
        :animate="{ opacity: 0.5 }"
        class="bg-(--van-black) w-screen h-screen fixed top-[calc(var(--van-tabs-line-height)+var(--van-tabs-padding-bottom)+var(--safe-area-inset-top))] left-0">
      </motion.div>
      <motion.div :style="{ zIndex }" :initial="{ height: 0, opacity: 0.3 }" :animate="{ height: 'auto', opacity: 1 }"
        :exit="{ height: 0, opacity: 0.3 }" v-if="isSearching" layout :transition="{ duration: 0.1 }"
        class="w-full flex flex-wrap max-h-[60vh] justify-evenly transition-all overflow-hidden bg-(--van-background-2) rounded-b-3xl pb-3 pt-1 fixed top-[calc(var(--van-tabs-line-height)+var(--van-tabs-padding-bottom)+var(--safe-area-inset-top))]">
        <VanList class="w-full">
          <template v-if="!isEmpty(histories)">
            <VanCell v-for="history of histories" :title="history" @click="searchText = history"
              class="van-haptics-feedback w-full" />
          </template>
        </VanList>
      </motion.div>
    </AnimatePresence>
  </Teleport>
</template>
