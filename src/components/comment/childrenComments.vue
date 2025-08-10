<script setup lang='ts'>
import { computed, shallowRef, useTemplateRef, watch } from 'vue'
import CommentRow from './commentRow.vue'
import { useTemp } from '@/stores/temp'
import { useElementSize } from '@vueuse/core'
import CommentSender from './commentSender.vue'
import FloatPopup from '@/components/floatPopup.vue'
import { Stream } from '@/utils/data'
import { bika } from '@/api/bika'
const floatPopup = useTemplateRef('floatPopup')
const $emit = defineEmits<{
  comment: [c: bika.comment.Comment]
  close: []
  showUser: [user: bika.user.UserProfile]
}>()
defineProps<{
  _father?: bika.comment.Comment
  closeRouter?: string
  anchors?: 'high' | 'low'
  uploader?: string
}>()
const ITEM_HEIGHT = 120
const _id = shallowRef('')
const temp = useTemp().$applyRaw('childrenCommentsStream', () => new Map<string, Stream<bika.comment.ChildComment>>())
const commitStream = shallowRef(bika.api.comment.createChildCommentsStream(''))
watch(_id, _id => commitStream.value = temp.has(_id) ? temp.get(_id)! : bika.api.comment.createChildCommentsStream(_id))
const reload = async () => {
  commitStream.value.reset()
  await commitStream.value.next()
}
defineExpose({
  show(commentId: string) {
    _id.value = commentId
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
      <CommentRow v-if="_father" :comment="_father" :is-highlight="uploader == _father.$_user?._id" :height=false
        show-children-comment @comment="$emit('comment', _father!)" class="!border-none"
        @show-user=" _father.$_user && $emit('showUser', _father.$_user)" />
    </div>
    <List :style="`height:calc(100% - ${topCommentElHeight}px - 40px);background-color:var(--van-background);`"
      :source="commitStream" :item-height="ITEM_HEIGHT" v-slot="{ height, data }">
      <CommentRow :comment="data.item" @show-user="data.item.$_user && $emit('showUser', data.item.$_user)"
        class="!border-none" :height :ellipsis="3" :is-highlight="uploader == data.item.$_user?._id" />
    </List>
    <CommentSender :aim-id="_father?._id" mode="comment" @afterSend="reload()" />
  </FloatPopup>
</template>