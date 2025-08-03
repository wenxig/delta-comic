<script setup lang='ts'>
import { onMounted, shallowRef, watch } from 'vue'
import ChildrenComments from './children.vue'
import PreviewUser from '@/components/user/previewUser.vue'
import CommentSender from './commentSender.vue'
import { onBeforeRouteLeave } from 'vue-router'
import CommentRow from './commentRow.vue'
import { comments, commentsScroll } from '@/stores/temp'
import List from '@/components/list.vue'
import { ComponentExposed } from 'vue-component-type-helpers'
import { createCommentsStream } from '@/api/bika/api/comment'
import { Comment } from '@/api/bika/comment'
import { useTabStatus } from 'vant'
const list = shallowRef<ComponentExposed<typeof List>>()
const $props = withDefaults(defineProps<{
  id: string
  listClass?: any
  class?: any
  streamMode?: 'comics' | 'games'
  uploader?: string
}>(), {
  streamMode: 'comics'
})
const commentStream = createCommentsStream($props.id, $props.streamMode)
const _father = shallowRef<Comment>()
const previewUser = shallowRef<InstanceType<typeof PreviewUser>>()
const childrenComments = shallowRef<InstanceType<typeof ChildrenComments>>()
onMounted(() => {
  // if (isEmpty(commitStream.docs.value)) commitStream.next()
  if (commentsScroll.has($props.id)) list.value?.listInstance?.scrollTo({ top: commentsScroll.get($props.id) })
})
const handleReloadCommit = () => {
  commentStream.reset()
  return commentStream.next()
}
onBeforeRouteLeave(() => {
  commentsScroll.set($props.id, list.value?.scrollTop ?? 0)
})
defineSlots<{
  default(): void
}>()

const commentSender = shallowRef<InstanceType<typeof CommentSender>>()
defineExpose({
  focusInput() {
    commentSender.value?.inputEl?.focus()
  },
  list
})

const isActive = useTabStatus()
</script>

<template>
  <div class="w-full bg-(--van-background) pb-[40px]" :class>
    <List item-resizable :source="commentStream" ref="list" :item-height="140"
      v-slot="{ data: { item }, height }" :class="$props.listClass" class="h-full">
      <CommentRow :comment="item" :isHighlight="item.$_user._id == uploader" :height show-children-comment @click="() => {
        _father = item
        childrenComments?.show(item._id)
      }" @show-user="previewUser?.show" :ellipsis="2">
        <slot />
      </CommentRow>
    </List>
  </div>
  <Teleport to="#cover" :disabled="!isActive">
    <VanSticky position="bottom" class="w-full">
      <CommentSender ref="commentSender" @afterSend="handleReloadCommit()" :aim-id="$props.id" mode="comics" />
    </VanSticky>
  </Teleport>
  <ChildrenComments ref="childrenComments" anchors="low" :uploader :_father @show-user="previewUser?.show" />
  <PreviewUser ref="previewUser" />
</template>
