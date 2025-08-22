<script setup lang='ts'>
import Image from '@/components/image.vue'
import { RowProps } from 'vant'
import { ArrowForwardIosRound } from '@vicons/material'
import { jm } from '@/api/jm'
import { computed } from 'vue'
import userIcon from '@/assets/images/userIcon.webp?url'

const $props = defineProps<{
  comment: jm.comment.Comment
  height: number | false
  minHeight?: number
  isHighlight?: boolean
  detailMode?: boolean
  childrenCommentCount: number
} & Partial<RowProps>>()
const $emit = defineEmits<{
  click: [c: jm.comment.Comment]
  showUser: [user: jm.user.CommonUser]
}>()
defineSlots<{
  default(): void
}>()
const cssHeightValue = computed(() => $props.height ? ($props.height + 'px') : 'unset')

</script>

<template>
  <VanRow v-bind="$props" @click="$emit('click', comment)"
    class="van-hairline--bottom relative bg-(--van-background-2) text-(--van-text-color) min-h-(--comment-min-height) h-(--comment-height) pb-4">
    <VanCol span="4" class="!flex justify-center items-start">
      <div @click.stop="$emit('showUser', comment.toCommonUser())">
        <Image :fallback="userIcon" :src="comment.$avatar" class="mt-2 size-10" round fit="cover" :retry-max="2" />
      </div>
    </VanCol>
    <VanCol class="!flex flex-col ml-1 relative" span="19">
      <div class="mt-2 mb-2 flex flex-col">
        <div class=" text-sm "
          :class="[isHighlight ? 'text-(--nui-primary-color) font-bold' : 'text-(--van-text-color)']">
          <span>{{ comment.username }}
            <template v-if="comment.nickname != comment.username">
              <span class="mr-0.5 text-(--nui-primary-color)">|</span>
              <span class="mr-1">{{ comment.nickname }}</span>
            </template>
          </span>
          <span class="mr-1 text-[11px] text-(--nui-primary-color) font-normal">Lv{{ comment.$expinfo.level }}</span>
          <span class="bg-(--nui-primary-color) rounded text-white text-[9px] px-0.5 py-0.5 -translate-y-0.5"
            v-if="isHighlight">UP</span>
        </div>
        <span class="text-[11px]  text-(--van-text-color-2)">
          {{ (comment.$addtime) }}
        </span>
      </div>
      <div v-html="comment.content"></div>

      <div v-if="childrenCommentCount > 0 && !detailMode"
        class="w-full rounded bg-(--van-gray-2)/80 dark:bg-(--van-text-color-2)/90 h-9 flex items-center mt-1 mb-3 text-(--nui-primary-color) pointer-events-none">
        <span class="ml-2 text-[13px]">共{{ childrenCommentCount }}条回复</span>
        <NIcon size="11px" class="ml-1">
          <ArrowForwardIosRound />
        </NIcon>
      </div>
    </VanCol>
  </VanRow>
</template>
<style scoped lang='scss'>
* {
  --comment-min-height: calc(v-bind(minHeight) * 1px);
  --comment-height: v-bind(cssHeightValue);
}
</style>