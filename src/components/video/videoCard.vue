<script setup lang='ts' generic="T extends (cosav.video.BaseVideo)">
import { StyleValue } from 'vue'
import { useRouter } from 'vue-router'
import { cosav } from '@/api/cosav'
import { LikeOutlined, UserOutlined } from '@vicons/antd'
import { useContentStore } from '@/stores/content'

const $props = withDefaults(defineProps<{
  video?: T
  height: number | string | false
  disabled?: boolean
  type?: 'default' | 'small'
  mode?: 'push' | 'replace'

  class?: any
  style?: StyleValue
}>(), {
  mode: 'push',
  type: 'default'
})
const $emit = defineEmits<{
  click: []
  resize: [video: T, height: number]
}>()
const $router = useRouter()
const contentStore = useContentStore()
const handleClick = () => {
  if (!$props.video) return
  $emit('click')
  contentStore.$load('cosav', $props.video.id, $props.video)
  $router.force[$props.mode](`/video/${$props.video?.id}`)
}

</script>

<template>
  <template v-if="video">
    <button :style="[{ height: height == false ? 'auto' : `${height}px` }, style]" @click="handleClick" :disabled
      :class="[{ 'van-haptics-feedback': !disabled }, $props.class]" ref="container" v-if="type == 'small'"
      class="overflow-hidden w-full rounded-lg block van-hairline--top-bottom bg-center bg-(--van-background-2) text-(--van-text-color) border-none relative active:bg-gray p-0 pb-1 items-center">
      <div class="w-full flex items-center relative">
        <Image v-if="!$slots.cover" :src="video.photo" class="rounded-t-lg w-full aspect-video" fit="cover"
          ref="cover" />
        <div
          class="absolute w-full h-6 !text-[10px] text-white bg-[linear-gradient(transparent,rgba(0,0,0,0.9))] bottom-0 flex text-nowrap pb-0.5 gap-1 pl-1 items-end justify-start *:flex *:items-center">
          <span>
            <VanIcon name="eye-o" class="mr-0.5" size="14px" />
            <span>{{ video.$viewnumber }}</span>
          </span>
          <span v-if="video.$cos_works[0]">
            <VanIcon class="mr-0.5" name="apps-o" size="14px" color="white" />
            <span>{{ video.$cos_works[0] }}</span>
          </span>
          <span class="absolute right-1 text-xs">
            {{ video.$UiDuration }}
          </span>
        </div>
      </div>
      <div class="w-full overflow-hidden p-1 flex flex-col text-(--van-text-color)">
        <div class="flex flex-nowrap">
          <span class="text-start text-sm">{{ video.title }}</span>
        </div>
        <div class="mt-1 w-full h-auto flex-nowrap flex items-center" v-if="video.author">
          <NIcon color="var(--van-text-color-2)" size="14px">
            <UserOutlined />
          </NIcon>
          <span @click.stop="$router.force[mode](`/search?keyword=${video.author}&mode=author`)"
            class="ml-0.5 text-xs van-ellipsis max-w-2/3 text-(--van-text-color-2)">
            {{ video.author }}
          </span>
        </div>
      </div>
    </button>
    <button ref="container" @click="handleClick" :disabled v-else-if="type == 'default'"
      class="overflow-hidden w-full van-hairline--top-bottom flex bg-center bg-(--van-background-2) text-(--van-text-color) border-none relative active:bg-gray p-0 items-center"
      :style="[{ height: height == false ? 'auto' : `${height}px` }, style]"
      :class="[{ 'van-haptics-feedback': !disabled }, $props.class]">
      <div class="ml-2 !rounded relative aspect-video w-[35%] z-2 bg-black">
        <Image :src="video.photo" class="size-full" fit="contain" ref="cover" />
        <span class="absolute right-1 bottom-1 text-white text-[10px] px-1 rounded bg-black/70">
          {{ video.$UiDuration }}
        </span>
      </div>
      <div class="w-[calc(65%-8px-8px-8px)] min-h-[98%] flex absolute right-2 flex-col *:text-justify">
        <span class="mt-[3%] van-multi-ellipsis--l2">{{ video.title }}</span>
        <div class="absolute bottom-2 text-(--van-text-color-2) text-sm">
          <div class="flex flex-nowrap items-center *:text-nowrap van-ellipsis" v-if="video.author">
            <NIcon color="var(--van-text-color-2)" size="14px">
              <UserOutlined />
            </NIcon>
            <span class="mr-2 van-haptics-feedback"
              @click.stop="$router.force[mode](`/search?keyword=${video.author}&mode=author`)">{{ video.author }}</span>
          </div>
          <div class="w-full flex -mt-1 text-sm">
            <span class="flex items-center mr-2">
              <VanIcon color="var(--van-text-color-2)" name="eye-o" size="14px" />
              <span class="ml-0.5">{{ video.$viewnumber }}</span>
            </span>
          </div>
        </div>
      </div>
    </button>
  </template>
</template>