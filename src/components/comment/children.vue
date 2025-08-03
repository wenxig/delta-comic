<script setup lang='ts'>
import { computed, ref, shallowRef, watch } from 'vue'
import CommentRow from './commentRow.vue'
import { childrenComments } from '@/stores/temp'
import { useElementSize } from '@vueuse/core'
import CommentSender from './commentSender.vue'
import FloatPopup from '@/components/floatPopup.vue'
import Popup from '@/components/popup.vue'
import { createChildCommentsStream } from '@/api/bika/api/comment'
import { UserProfile } from '@/api/bika/user'
import { Comment } from '@/api/bika/comment'
const floatPopup = shallowRef<InstanceType<typeof FloatPopup>>()
const $emit = defineEmits<{
  comment: [c: Comment]
  close: []
  showUser: [user: UserProfile]
}>()
defineProps<{
  _father?: Comment
  closeRouter?: string
  anchors?: 'high' | 'low'
  uploader?: string
}>()
const ITEM_HEIGHT = 120
const _id = shallowRef('')

const commitStream = shallowRef(createChildCommentsStream(''))

watch(_id, _id => {
  if (childrenComments.has(_id)) commitStream.value = childrenComments.get(_id)!
  else childrenComments.set(_id, commitStream.value = createChildCommentsStream(_id))
  // if (!commitStream.value.done.value) commitStream.value.next()
})
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
const topCommentEl = ref<HTMLDivElement>()
const { height: topCommentElHeight } = useElementSize(topCommentEl)

const fullComment = ref<Comment>()
const showComment = shallowRef(false)
</script>

<template>
  <FloatPopup ref="floatPopup" :anchors lock-scroll>
    <div ref="topCommentEl">
      <CommentRow v-if="_father" :comment="_father" :is-highlight="uploader == _father.$_user._id" :height="ITEM_HEIGHT"
        show-children-comment @comment="$emit('comment', _father!)" class="!border-none"
        @show-user="$emit('showUser', _father.$_user)" />
    </div>
    <List :style="`height:calc(100% - ${topCommentElHeight}px - 40px);background-color:var(--van-background);`"
      :source="commitStream" :item-height="ITEM_HEIGHT" v-slot="{ height, data }">
      <CommentRow :comment="data.item" @show-user="$emit('showUser', data.item.$_user)" class="!border-none" :height
        :ellipsis="3" @click="showComment = !!(fullComment = data.item)"
        :is-highlight="uploader == data.item.$_user._id" />
    </List>
    <CommentSender :aim-id="_father?._id" mode="comment" @afterSend="reload()" />
  </FloatPopup>
  <Popup class="overflow-hidden" v-model:show="showComment" position="bottom" round closeable
    @closed="fullComment = undefined">
    <CommentRow v-if="fullComment" :comment="fullComment" :height="ITEM_HEIGHT"
      @comment="$emit('comment', fullComment!)" @show-user="$emit('showUser', fullComment.$_user)" />
  </Popup>
</template>