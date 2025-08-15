<script setup lang='ts'>
import { computed, useTemplateRef } from 'vue'
import { useElementSize } from '@vueuse/core'
import FloatPopup from '@/components/floatPopup.vue'
import { jm } from '@/api/jm'
import { RStream } from '@/utils/data'
const floatPopup = useTemplateRef('floatPopup')
const $emit = defineEmits<{
  comment: [c: jm.comment.Comment]
  close: []
  showUser: [user: jm.user.ExpInfo]
}>()
defineProps<{
  father?: jm.comment.Comment
  closeRouter?: string
  anchors?: 'high' | 'low'
  uploader?: string
  stream: RStream<jm.comment.Comment>
}>()
defineExpose({
  show() {
    floatPopup.value?.show()
  },
  close() {
    floatPopup.value?.close()
  },
  isShowing: computed(() => floatPopup.value?.isShowing ?? false)
})
const topCommentEl = useTemplateRef('topCommentEl')
const { height: topCommentElHeight } = useElementSize(topCommentEl)

</script>

<template>
  <FloatPopup ref="floatPopup" :anchors lock-scroll>
    <div ref="topCommentEl">
      <JmCommentRow v-if="father" :comment="father" :height=false show-children-comment
        @comment="$emit('comment', father!)" class="!border-none" detail-mode :children-comment-count="0"
        @show-user=" father.$expinfo && $emit('showUser', father.$expinfo)" />
    </div>
    <Waterfall :style="`height:calc(100% - ${topCommentElHeight}px - 40px)`" :source="stream" v-slot="{ item, length }"
      class="bg-(--van-background)" :col="1" :gap="0" :padding="0" :minHeight="0"
      :data-processor="v => v.filter(v => v.$parent_CID == father?.$CID)">
      <JmCommentRow :children-comment-count="length" :comment="item"
        @show-user="item.$expinfo && $emit('showUser', item.$expinfo)" class="!border-none" :height="false" />
    </Waterfall>
    <JmCommentSender v-if="father" :comic-id="father.$AID" :comment-id="father.$CID" mode="comment" />
  </FloatPopup>
</template>