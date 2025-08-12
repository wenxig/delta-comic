<script setup lang='ts'>
import { onMounted, shallowRef } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { useTemp } from '@/stores/temp'
import { ComponentExposed } from 'vue-component-type-helpers'
import { useTemplateRef } from 'vue'
import ChildrenComments from './childrenComments.vue'
import { bika } from '@/api/bika'
import Waterfall from '../waterfall.vue'
const waterfall = useTemplateRef<ComponentExposed<typeof Waterfall>>('waterfall')
const $props = withDefaults(defineProps<{
  id: string
  listClass?: any
  class?: any
  streamMode?: 'comics' | 'games'
  uploader?: string
}>(), {
  streamMode: 'comics'
})
const commentStream = bika.api.comment.createCommentsStream($props.id, $props.streamMode)
const _father = shallowRef<bika.comment.Comment>()
const previewUser = useTemplateRef('previewUser')
const childrenComments = useTemplateRef('childrenComments')
const temp = useTemp().$applyRaw('commentsScroll', () => new Map<string, number>())
onMounted(() => {
  if (temp.has($props.id)) waterfall.value?.scrollParent?.scrollTo({ top: temp.get($props.id) })
})
const handleReloadCommit = () => {
  commentStream.reset()
  return commentStream.next()
}
onBeforeRouteLeave(() => {
  temp.set($props.id, waterfall.value?.scrollTop ?? 0)
})
defineSlots<{
  default(): void
}>()

const commentSender = useTemplateRef('commentSender')
defineExpose({
  focusInput() {
    commentSender.value?.inputEl?.focus()
  },
  list: waterfall
})

</script>

<template>
  <div class="w-full bg-(--van-background) pb-[40px]" :class>
    <Waterfall :source="commentStream" ref="waterfall" :class="$props.listClass" class="h-full"
      v-slot="{ item, minHeight }" :col="1" :gap="0" :padding="0" :minHeight="0">
      <CommentRow :comment="item" :minHeight :isHighlight="item.$_user?._id == uploader" :height="false"
        show-children-comment @click="() => {
          _father = item
          childrenComments?.show(item._id)
        }" @show-user="previewUser?.show">
        <slot />
      </CommentRow>
    </Waterfall>
    <CommentSender ref="commentSender" @afterSend="handleReloadCommit()" :aim-id="$props.id" mode="comics" />
  </div>
  <ChildrenComments ref="childrenComments" anchors="low" :uploader :_father @show-user="previewUser?.show" />
  <PreviewUser ref="previewUser" />
</template>
