<script setup lang='ts'>
import Image from '@/components/image.vue'
import { RowProps } from 'vant'
import { createDateString } from '@/utils/translator'
import { LikeOutlined } from '@vicons/antd'
import { ArrowForwardIosRound, ChatBubbleOutlineRound, NearbyErrorRound } from '@vicons/material'
import { createLoadingMessage } from '@/utils/message'
import { jm } from '@/api/jm'
import { computed } from 'vue'
import userIcon from '@/assets/images/userIcon.webp?url'
import symbol from '@/symbol'

const $props = defineProps<{
  comment: jm.comment.Comment
  height: number | false
  minHeight?: number
  showChildrenComment?: boolean
  ellipsis?: number | undefined
  isHighlight?: boolean
  detailMode?: boolean
} & Partial<RowProps>>()
const $emit = defineEmits<{
  click: [c: jm.comment.Comment]
}>()
defineSlots<{
  default(): void
}>()
const cssHeightValue = computed(() => $props.height ? ($props.height + 'px') : 'unset')
</script>

<template>
  <VanRow v-bind="$props" @click="$emit('click', comment)"
    class="van-hairline--bottom relative bg-(--van-background-2) text-(--van-text-color) min-h-(--comment-min-height) h-(--comment-height) pb-1">
    <VanCol span="4" class="!flex justify-center items-start">
      <div>
        <Image :fallback="userIcon" :src="new jm.image.Image(`/media/users/${comment.$UID}.jpg`)" class="mt-2 size-10"
          round fit="cover" />
      </div>
    </VanCol>
    <VanCol class="!flex flex-col ml-1 relative" span="19">
      <div class="mt-2 mb-2 flex flex-col">
        <div class=" text-sm "
          :class="[isHighlight ? 'text-(--nui-primary-color) font-bold' : 'text-(--van-text-color)']">
          <span>{{ comment.username }}<span
              class="mx-0.5 text-(--nui-primary-color)">|</span>{{ comment.nickname }}</span>
          <span class="mr-1 text-[11px] text-(--nui-primary-color) font-normal">Lv{{ comment.$expinfo.level }}</span>
          <span class="bg-(--nui-primary-color) rounded text-white text-[9px] px-0.5 py-0.5 -translate-y-0.5"
            v-if="isHighlight">UP</span>
        </div>
        <span class="text-[11px]  text-(--van-text-color-2)">
          {{ createDateString(comment.$update_at) }}
        </span>
      </div>
      <VanTextEllipsis rows="3"
        :content="comment.content.replace(symbol.jmCommentPrefixRemove, '').replace(symbol.jmCommentEndfixRemove, '')"
        @click-action.stop>
        <template #action="{ expanded }"><br><span>{{ expanded ? '收起' : '展开' }}</span></template>
      </VanTextEllipsis>

      <!-- <div class="-ml-0.5 mt-2 mb-1 flex gap-3">
        <ToggleIcon :icon="LikeOutlined" row-mode v-model="comment.isLiked"
          @change="jm.api.comment.likeComment(comment._id)" size="16px">
          {{ comment.likesCount || '' }}
        </ToggleIcon>

        <ToggleIcon v-if="showChildrenComment" :icon="ChatBubbleOutlineRound" row-mode dis-changed size="16px"
          class="font-bold">
          {{ comment.commentsCount || '' }}
        </ToggleIcon>
        <NPopconfirm @positive-click="() => {
          createLoadingMessage().bind(jm.api.comment.reportComment(comment._id))
        }">
          <template #trigger>
            <NButton @click.stop text icon class="flex items-center">
              <template #icon>
                <NIcon size="16px">
                  <NearbyErrorRound />
                </NIcon>
              </template>
            </NButton>
          </template>
          确定举报?
        </NPopconfirm>
        <slot />
      </div> -->

      <!-- <div v-if="comment.commentsCount > 0 && !detailMode"
        class="w-full rounded bg-(--van-gray-2)/80 dark:bg-(--van-text-color-2)/90 h-9 flex items-center mt-1 mb-3 text-(--nui-primary-color) pointer-events-none">
        <span class="ml-2 text-[13px]">共{{ comment. }}条回复</span>
        <NIcon size="11px" class="ml-1">
          <ArrowForwardIosRound />
        </NIcon>
      </div> -->
    </VanCol>
  </VanRow>
</template>
<style scoped lang='scss'>
* {
  --comment-min-height: calc(v-bind(minHeight) * 1px);
  --comment-height: v-bind(cssHeightValue);
}
</style>