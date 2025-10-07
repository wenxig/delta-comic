<script setup lang='ts'>
import { computed, shallowRef, useTemplateRef } from 'vue'
import { Comp, uni } from 'delta-comic-core'
const $props = defineProps<{
  item: uni.item.Item
}>()
const floatPopup = useTemplateRef('floatPopup')
const parentComment = shallowRef<uni.comment.Comment>()
defineExpose({
  loadChild(parent: uni.comment.Comment) {
    parentComment.value = parent
    floatPopup.value?.show()
  }
})
const CommentRow = computed(() => uni.comment.Comment.getCommentRow($props.item.contentType))

</script>

<template>
  <Comp.FloatPopup anchors="high" lock-scroll ref="floatPopup">
    <Comp.Waterfall :source="parentComment.children" :padding="0" :col="1" :gap="0"
      :data-processor="v => parentComment ? [parentComment, ...v] : v" v-if="parentComment"
      v-slot="{ item: comment, index }" class="bg-(--van-background) !h-[calc(100%-40px)]">
      <div>
        <component :is="CommentRow" :parentComment :comment :item @click="" />
        <div v-if="index == 0"
          class="van-hairline--top-bottom w-full h-10 flex pl-3 items-center bg-(--van-background-2)">
          子评论详情
        </div>
      </div>
    </Comp.Waterfall>
    <Sender :item :aim="parentComment" v-if="parentComment" />
  </Comp.FloatPopup>
</template>