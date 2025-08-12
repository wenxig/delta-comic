<script setup lang='ts'>
import Image from '@/components/image.vue'
import { RowProps } from 'vant'
import { createDateString } from '@/utils/translator'
import { LikeOutlined } from '@vicons/antd'
import { ArrowForwardIosRound, ChatBubbleOutlineRound, NearbyErrorRound } from '@vicons/material'
import { createLoadingMessage } from '@/utils/message'
import { bika } from '@/api/bika'
import { computed } from 'vue'
const $props = defineProps<{
  comment: bika.comment.Comment
  height: number | false
  minHeight?: number
  showChildrenComment?: boolean
  ellipsis?: number | undefined
  isHighlight?: boolean
  detailMode?: boolean
} & Partial<RowProps>>()
const $emit = defineEmits<{
  click: [c: bika.comment.Comment]
  showUser: [user: bika.user.UserMe]
}>()
defineSlots<{
  default(): void
}>()
const cssHeightValue = computed(() => $props.height ? ($props.height + 'px') : 'unset')
</script>

<template>
  <VanRow v-bind="$props" @click="comment.$_user && $emit('click', comment)"
    class="van-hairline--bottom relative bg-(--van-background-2) text-(--van-text-color) min-h-(--comment-min-height) h-(--comment-height) pb-1">
    <VanCol span="4" class="!flex justify-center items-start">
      <div @click.stop="$emit('showUser', comment.$_user)" v-if="comment.$_user">
        <Image :src="comment.$_user.$avatar" class="mt-2 size-10" round fit="cover" />
      </div>
    </VanCol>
    <VanCol class="!flex flex-col ml-1 relative" span="19">
      <div class="mt-2 mb-2 flex flex-col">
        <div class=" text-sm "
          :class="[isHighlight ? 'text-(--nui-primary-color) font-bold' : 'text-(--van-text-color)']">
          {{ comment.$_user?.name ?? '' }}
          <span class="mr-1 text-[11px] text-(--nui-primary-color) font-normal">Lv{{ comment.$_user?.level }}</span>
          <span class="bg-(--nui-primary-color) rounded text-white text-[9px] px-0.5 py-0.5 -translate-y-0.5"
            v-if="isHighlight">UP</span>
        </div>
        <span class="text-[11px]  text-(--van-text-color-2)">
          {{ createDateString(comment.$created_at) }}
        </span>
      </div>
      <template v-if="comment.hide">
        <div class="h-auto text-wrap text-(--van-text-color-2)">评论被举报</div>
      </template>
      <template v-else>
        <VanTag type="primary" v-if="comment.isTop" plain class="mr-1">置顶</VanTag>
        <VanTextEllipsis rows="3" :content="comment.content" @click-action.stop>
          <template #action="{ expanded }"><br><span>{{ expanded ? '收起' : '展开' }}</span></template>
        </VanTextEllipsis>
      </template>

      <div class="-ml-0.5 mt-2 mb-1 flex gap-3">
        <ToggleIcon :icon="LikeOutlined" row-mode v-model="comment.isLiked"
          @change="bika.api.comment.likeComment(comment._id)" size="16px">
          {{ comment.likesCount || '' }}
        </ToggleIcon>

        <ToggleIcon v-if="showChildrenComment" :icon="ChatBubbleOutlineRound" row-mode dis-changed size="16px"
          class="font-bold">
          {{ comment.commentsCount || '' }}
        </ToggleIcon>
        <NPopconfirm @positive-click="() => {
          createLoadingMessage().bind(bika.api.comment.reportComment(comment._id))
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
      </div>

      <div v-if="comment.commentsCount > 0 && !detailMode"
        class="w-full rounded bg-(--van-gray-2)/80 dark:bg-(--van-text-color-2)/90 h-9 flex items-center mt-1 mb-3 text-(--nui-primary-color) pointer-events-none">
        <span class="ml-2 text-[13px]">共{{ comment.commentsCount }}条回复</span>
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