<script setup lang='ts' generic="T extends (cosav.video.BaseVideo)">
import { StyleValue } from 'vue'
import { useRouter } from 'vue-router'
import { cosav } from '@/api/cosav'
import { LikeOutlined, UserOutlined } from '@vicons/antd'
import { isEmpty } from 'lodash-es'

const $props = withDefaults(defineProps<{
  video?: T
  height: number | string | false
  disabled?: boolean
  type?: 'default' | 'big' | 'small'
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
const handleClick = () => {
  if (!$props.video) return
  $emit('click')
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
          class="absolute w-full h-6 !text-[10px] text-white bg-[linear-gradient(transparent,rgba(0,0,0,0.9))] bottom-0 flex pb-0.5 gap-1 pl-1 items-end justify-start *:flex *:items-center">
          <span>
            <VanIcon name="eye-o" class="mr-0.5" size="14px" />
            <span>{{ video.$viewnumber }}</span>
          </span>
          <span>
            <NIcon class="mr-0.5" size="14px" color="white">
              <LikeOutlined />
            </NIcon>
            <span>{{ video.$likes }}</span>
          </span>
          <span class="absolute right-1">
            {{ video.$duration }}
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
  </template>
</template>