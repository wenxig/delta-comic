<script setup lang='ts'>
import Image from '@/components/image.vue'
import { RowProps } from 'vant'
import { isNumber } from 'lodash-es'
import { createDateString } from '@/utils/translator'
import { LikeFilled } from '@vicons/antd'
import { ChatBubbleOutlineRound, NearbyErrorRound } from '@vicons/material'
import { createLoadingMessage } from '@/utils/message'
import { bika } from '@/api/bika'
import { computed, StyleValue } from 'vue'
const $props = defineProps<{
  comment: bika.comment.Comment
  height: number | false
  minHeight?: number
  showChildrenComment?: boolean
  ellipsis?: number | undefined
  isHighlight?: boolean
} & Partial<RowProps>>()
const $emit = defineEmits<{
  click: [c: bika.comment.Comment]
  showUser: [user: bika.user.UserProfile]
}>()
defineSlots<{
  default(): void
}>()
const cssHeightValue = computed(() => $props.height ? ($props.height + 'px') : 'unset')
</script>

<template>
  <VanRow v-bind="$props" @click="comment.$_user && $emit('click', comment)"
    class="van-hairline--bottom relative pb-8 bg-(--van-background-2) text-(--van-text-color) min-h-(--comment-min-height) h-(--comment-height)">
    <VanCol span="4" class="!flex justify-center items-start">
      <div @click.stop="$emit('showUser', comment.$_user)" v-if="comment.$_user">
        <Image :src="comment.$_user.$avatar" class="mt-2 size-10" round fit="cover" />
      </div>
    </VanCol>
    <VanCol class="!flex flex-col ml-1 relative" span="19">
      <div class="mt-2 flex flex-col">
        <div class=" text-sm "
          :class="[isHighlight ? 'text-(--nui-primary-color) font-bold' : 'text-(--van-text-color)']">
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
        <Text :text="comment.content" :ellipsis="height ? (isNumber($props.ellipsis) ? ellipsis : 2) : undefined">
          <VanTag type="primary" v-if="comment.isTop" plain class="mr-1">置顶</VanTag>
        </Text>
      </template>
    </VanCol>
    <div class="absolute bottom-1.5 -translate-x-4 left-4/19 flex">
      <ToggleIcon :icon="LikeFilled" row-mode v-model="comment.isLiked"
        @change="bika.api.comment.likeComment(comment._id)" size="16px">
        {{ comment.likesCount || '' }}
      </ToggleIcon>

      <ToggleIcon v-if="showChildrenComment" :icon="ChatBubbleOutlineRound" row-mode dis-changed size="16px"
        class="font-bold ml-2">
        {{ comment.commentsCount || '' }}
      </ToggleIcon>
      <NPopconfirm @positive-click="() => {
        createLoadingMessage().bind(bika.api.comment.reportComment(comment._id))
      }">
        <template #trigger>
          <NButton @click.stop text icon class="flex items-center !ml-2 ">
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
<style scoped lang='scss'>
* {
  --comment-min-height: calc(v-bind(minHeight) * 1px);
  --comment-height: v-bind(cssHeightValue);
}
</style>