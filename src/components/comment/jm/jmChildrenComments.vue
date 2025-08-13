<script setup lang='ts'>
import { computed, shallowRef, useTemplateRef } from 'vue'
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
        @comment="$emit('comment', father!)" class="!border-none" detail-mode
        @show-user=" father.$expinfo && $emit('showUser', father.$expinfo)" />
    </div>
    <Waterfall :style="`height:calc(100% - ${topCommentElHeight}px - 40px)`" :source="stream" v-slot="{ item }"
      class="bg-(--van-background)">
      <JmCommentRow :comment="item" @show-user="item.$expinfo && $emit('showUser', item.$expinfo)" class="!border-none"
        :height="false" />
    </Waterfall>
    <JmCommentSender :aim-id="father?.$CID" mode="comment" />
  </FloatPopup>
</template>