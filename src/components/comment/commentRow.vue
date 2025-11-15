<script setup lang='ts'>
import { LikeOutlined } from '@vicons/antd'
import { ArrowForwardIosRound, ChatBubbleOutlineRound, NearbyErrorRound } from '@vicons/material'
import { computed } from 'vue'
import userIcon from '@/assets/images/userIcon.webp?url'
import { Comp, uni, Utils } from 'delta-comic-core'
const $props = defineProps<{
  comment: uni.comment.Comment
  parentComment?: uni.comment.Comment
  usernameHighlight?: boolean
}>()
const $emit = defineEmits<{
  click: [c: uni.comment.Comment]
  clickUser: [u: uni.user.User]
}>()
defineSlots<{
  default(): void
  userExtra(): void
}>()

const isParentSender = computed(() => $props.comment.sender.name == $props.parentComment?.sender.name)
</script>

<template>
  <VanRow v-bind="$props" @click="$emit('click', comment)"
    class="van-hairline--bottom relative bg-(--van-background-2) text-(--van-text-color) pb-1">
    <VanCol span="4" class="!flex justify-center items-start">
      <div>
        <Comp.Image :fallback="userIcon" :src="comment.sender.avatar ?? userIcon" class="mt-2 size-10" round fit="cover"
          @click="$emit('clickUser', comment.sender)" />
      </div>
    </VanCol>
    <VanCol class="!flex flex-col ml-1 relative" span="19">
      <div class="mt-2 mb-2 flex flex-col" @click.stop="$emit('clickUser', comment.sender)">
        <div class="text-sm text-(--van-text-color)">
          <div class=" text-sm "
            :class="[(usernameHighlight || isParentSender) ? 'text-(--nui-primary-color) font-bold' : 'text-(--van-text-color)']">
            {{ comment.sender.name ?? '' }}
            <span class="bg-(--nui-primary-color) rounded text-white text-[9px] px-0.5 py-0.5 -translate-y-0.5"
              v-if="isParentSender">LZ</span>
            <slot name="userExtra"></slot>
          </div>
        </div>
        <span class="text-[11px]  text-(--van-text-color-2)">
          {{ Utils.translate.createDateString(comment.$time()) }}
        </span>
      </div>
      <template v-if="comment.reported">
        <div class="h-auto text-wrap text-(--van-text-color-2)">评论被举报</div>
      </template>
      <div v-else>
        <VanTag type="primary" v-if="comment.isTop" plain class="mr-1 !inline">置顶</VanTag>
        <VanTextEllipsis rows="3" :content="comment.content.text" @click-action.stop class="!inline"
          v-if="comment.content.type == 'string'">
          <template #action="{ expanded }"><br><span>{{ expanded ? '收起' : '展开' }}</span></template>
        </VanTextEllipsis>
        <div v-else></div>
      </div>

      <div class="-ml-0.5 mt-2 mb-1 flex gap-3">
        <Comp.ToggleIcon :icon="LikeOutlined" row-mode v-model="comment.isLiked" @change="comment.like()" size="16px">
          {{ (comment.likeCount + (comment.isLiked ? 1 : 0)) || '' }}
        </Comp.ToggleIcon>
        <Comp.ToggleIcon :icon="ChatBubbleOutlineRound" row-mode dis-changed size="16px" class="font-bold">
          {{ comment.childrenCount || '' }}
        </Comp.ToggleIcon>
        <NPopconfirm @positive-click="() => {
          Utils.message.createLoadingMessage().bind(comment.report())
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

      <div v-if="comment.childrenCount > 0 && !isParentSender"
        class="w-full rounded bg-(--van-gray-2)/80 dark:bg-(--van-text-color-2)/90 h-9 flex items-center mt-1 mb-3 text-(--nui-primary-color) pointer-events-none">
        <span class="ml-2 text-[13px]">共{{ comment.childrenCount }}条回复</span>
        <NIcon size="11px" class="ml-1">
          <ArrowForwardIosRound />
        </NIcon>
      </div>
    </VanCol>
  </VanRow>
</template>