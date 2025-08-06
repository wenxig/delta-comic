<script setup lang='ts'>
import Image from '@/components/image.vue'
import { RowProps } from 'vant'
import { Comment } from '@/api/bika/comment'
import { UserProfile } from '@/api/bika/user'
import { likeComment, reportComment } from '@/api/bika/api/comment'
import { isNumber } from 'lodash-es'
import { createDateString } from '@/utils/translator'
import { LikeFilled, LikeOutlined } from '@vicons/antd'
import { ChatBubbleOutlineRound, NearbyErrorRound } from '@vicons/material'
import { useMessage } from 'naive-ui'
import { createLoadingMessage } from '@/utils/message'
const $props = defineProps<{
  comment: Comment
  height: number
  showChildrenComment?: boolean
  ellipsis?: number | undefined
  isHighlight?: boolean
} & Partial<RowProps>>()
const $emit = defineEmits<{
  click: [c: Comment]
  showUser: [user: UserProfile]
}>()
defineSlots<{
  default(): void
}>()
</script>

<template>
  <VanRow v-bind="$props" class="van-hairline--bottom relative pb-6 bg-(--van-background-2) text-(--van-text-color)"
    :style="`height:${height}px !important;`" @click="comment.$_user && $emit('click', comment)">
    <VanCol span="4" class="!flex justify-center items-start">
      <div @click.stop="$emit('showUser', comment.$_user)" v-if="comment.$_user">
        <Image :src="comment.$_user.$avatar" class="mt-2 size-10" round fit="cover" />
      </div>
    </VanCol>
    <VanCol class="!flex flex-col ml-1 relative" span="19">
      <div class="mt-2 flex flex-col">
        <div class=" text-sm "
          :class="[isHighlight ? 'text-(--nui-primary-color) font-bold' : 'text-(--van-text-color) font-light']">
          {{ comment.$_user?.name ?? '' }}
          <span class="mr-1 text-[11px] text-(--nui-primary-color) font-normal">Lv{{ comment.$_user?.level }}</span>
          <span class="bg-(--nui-primary-color) rounded text-white text-[9px] px-0.5 py-0.5 -translate-y-0.5"
            v-if="isHighlight">UP</span>
        </div>
        <span class="text-[10px] font-light -mt-1 text-(--van-text-color-2)">
          {{ createDateString(comment.$created_at) }}
        </span>
      </div>
      <template v-if="comment.hide">
        <div class="h-auto text-wrap text-(--van-text-color-2)">评论被举报</div>
      </template>
      <template v-else>
        <Text :text="comment.content" :ellipsis="isNumber($props.ellipsis) ? ellipsis : 2">
          <VanTag type="primary" v-if="comment.isTop" plain class="mr-1">置顶</VanTag>
        </Text>
      </template>
    </VanCol>
    <div class="absolute bottom-1 -translate-x-4 left-4/19 flex">
      <ToggleIcon :icon="LikeFilled" row-mode v-model="comment.isLiked" @change="likeComment(comment._id)" size="16px">
        {{ comment.likesCount || '' }}
      </ToggleIcon>

      <ToggleIcon v-if="showChildrenComment" :icon="ChatBubbleOutlineRound" row-mode dis-changed size="16px"
        class="font-bold ml-2">
        {{ comment.commentsCount || '' }}
      </ToggleIcon>
      <NPopconfirm @positive-click="() => {
        createLoadingMessage().bind(reportComment(comment._id))
      }">
        <template #trigger>
          <NButton text icon class="flex items-center !ml-2 ">
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
  </VanRow>
</template>