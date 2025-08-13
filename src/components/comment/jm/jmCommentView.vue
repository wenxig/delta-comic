<script setup lang='ts'>
import { onMounted, shallowRef } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { useTemp } from '@/stores/temp'
import { ComponentExposed } from 'vue-component-type-helpers'
import { useTemplateRef } from 'vue'
import Waterfall from '../../waterfall.vue'
import { jm } from '@/api/jm'
const waterfall = useTemplateRef<ComponentExposed<typeof Waterfall>>('waterfall')
const $props = withDefaults(defineProps<{
  id: number
  listClass?: any
  class?: any
}>(), {
})
const commentStream = jm.api.comment.createCommentsStream($props.id)
const father = shallowRef<jm.comment.Comment>()
const previewUser = useTemplateRef('previewUser')
const childrenComments = useTemplateRef('childrenComments')
const temp = useTemp().$applyRaw('commentsScroll', () => new Map<number, number>())
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
    <Waterfall :source="commentStream" :data-processor="v => v.filter(v => v.$parent_CID == 0)" ref="waterfall"
      :class="$props.listClass" class="h-full" v-slot="{ item, minHeight }" :col="1" :gap="0" :padding="0"
      :minHeight="0">
      <JmCommentRow :comment="item" :minHeight :height="false" show-children-comment @click="() => {
        father = item
        childrenComments?.show()
      }" @show-user="previewUser?.show">
        <slot />
      </JmCommentRow>
    </Waterfall>
    <JmCommentSender ref="commentSender" @afterSend="handleReloadCommit()" :aim-id="$props.id" mode="comics" />
  </div>
  <JmChildrenComments ref="childrenComments" anchors="low" :stream="commentStream" :father />
  <PreviewUser ref="previewUser" />
</template>
