<script setup lang='ts'>
import { onMounted, shallowRef } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { useTemp } from '@/stores/temp'
import List from '@/components/list.vue'
import { ComponentExposed } from 'vue-component-type-helpers'
import { createCommentsStream } from '@/api/bika/api/comment'
import { Comment } from '@/api/bika/comment'
import { useTemplateRef } from 'vue'
import ChildrenComments from './childrenComments.vue'
const list = useTemplateRef<ComponentExposed<typeof List>>('list')
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
const previewUser = useTemplateRef('previewUser')
const childrenComments = useTemplateRef('childrenComments')
const temp = useTemp().$applyRaw('commentsScroll', () => new Map<string, number>())
onMounted(() => {
  if (temp.has($props.id)) list.value?.listInstance?.scrollTo({ top: temp.get($props.id) })
})
const handleReloadCommit = () => {
  commentStream.reset()
  return commentStream.next()
}
onBeforeRouteLeave(() => {
  temp.set($props.id, list.value?.scrollTop ?? 0)
})
defineSlots<{
  default(): void
}>()

const commentSender = useTemplateRef('commentSender')
defineExpose({
  focusInput() {
    commentSender.value?.inputEl?.focus()
  },
  list
})

</script>

<template>
  <div class="w-full bg-(--van-background) pb-[40px]" :class>
    <List item-resizable :source="commentStream" ref="list" :item-height="140" v-slot="{ data: { item }, height }"
      :class="$props.listClass" class="h-full">
      <CommentRow :comment="item" :isHighlight="item.$_user?._id == uploader" :height show-children-comment @click="() => {
        _father = item
        childrenComments?.show(item._id)
      }" @show-user="previewUser?.show" :ellipsis="2">
        <slot />
      </CommentRow>
    </List>
    <CommentSender ref="commentSender" @afterSend="handleReloadCommit()" :aim-id="$props.id" mode="comics" />
  </div>
  <ChildrenComments ref="childrenComments" anchors="low" :uploader :_father @show-user="previewUser?.show" />
  <PreviewUser ref="previewUser" />
</template>
