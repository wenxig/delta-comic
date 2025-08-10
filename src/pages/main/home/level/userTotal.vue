<script setup lang='ts'>
import { inject,  useTemplateRef, watch } from 'vue'
import PreviewUser from '@/components/user/previewUser.vue'
import { useConfig } from '@/config'
import { useBikaStore } from '@/stores'
const previewUser = useTemplateRef('previewUser')
const bikaStore = useBikaStore()
const config = useConfig()
import List from '@/components/list.vue'
import symbol from '@/symbol'
import { ComponentExposed } from 'vue-component-type-helpers'
const list = useTemplateRef<ComponentExposed<typeof List>>('list')
const showNavBar = inject(symbol.showNavBar)!
watch(() => list.value?.scrollTop, async (scrollTop, old) => {
  if (!scrollTop || !old) return
  if (scrollTop - old > 0) showNavBar.value = false
  else showNavBar.value = true
}, { immediate: true })

</script>

<template>
  <List :item-height="100"
    :source="{ data: bikaStore.levelboard.useProcessor(lv => lv.users), isEnd: true }"
    class="h-full text-(--van-text-color) w-full" ref="list" v-slot="{ data: { item: user, index }, height }">
    <div class="flex" :style="`height: ${height}px;`" @click="previewUser?.show(user)">
      <div
        :style="[`background-color:rgba(219,54,124,${1 - (index * 0.1)});`, `color: rgb(${config.isDark ? 255 : (255 / 40) * (40 - (index + 1))},${config.isDark ? 255 : (255 / 40) * (40 - (index + 1))},${config.isDark ? 255 : (255 / 40) * (40 - (index + 1))});`]"
        class="flex justify-center items-center text-3xl w-1/10 van-hairline--top text-white">
        {{ index + 1 }}
      </div>
      <div class="w-[90%] van-hairline--bottom bg-(--van-background-2) h-full flex items-center">
        <Image :src="user.$avatar" class="h-[80px] w-[80px] ml-1" round />
        <div class="ml-3 w-[calc(100%-80px-(4px*3))] h-full flex flex-col ">
          <span class="text-xl font-bold">{{ user.name }}</span>
          <span class="text-(--nui-primary-color) -mt-1">lv.{{ user.level }}</span>
          <span class="text-gray-600 text-lg -mt-1">上传数:{{ user.comicsUploaded }}</span>
        </div>
      </div>
    </div>
  </List>
  <PreviewUser ref="previewUser" />
</template>