<script setup lang='ts'>
import { computed, shallowRef, useTemplateRef } from 'vue'
import FloatPopup from '@/components/floatPopup.vue'
import { useElementSize } from '@vueuse/core'
import { bika } from '@/api/bika'
import { jm } from '@/api/jm'

const floatPopup = useTemplateRef('floatPopup')
const contentBox = useTemplateRef('contentBox')
const { height: contentBoxHeight } = useElementSize(contentBox)
const user = shallowRef<bika.user.User | jm.user.CommonUser>()

defineExpose({
  show(u: bika.user.User | jm.user.CommonUser) {
    floatPopup.value?.show(1)
    user.value = u
  },
  isShowing: computed(() => floatPopup.value?.isShowing),
  close() {
    floatPopup.value?.close()
  }
})
const anchors = computed(() => [0, (contentBoxHeight.value || Math.floor(window.innerHeight * 0.20)) + 30, 42 + 30 + (contentBoxHeight.value || Math.floor(window.innerHeight * 0.20))])
</script>

<template>
  <FloatPopup ref="floatPopup" :anchors overlay class="overflow-hidden">
    <div class="overflow-hidden">
      <div ref="contentBox" class="w-full flex justify-center items-start backdrop-blur-lg van-hairline--bottom">
        <BikaUserInfo :user class="min-h-[20vh]" v-if="bika.user.User.is(user)" />
        <JmUserInfo :user class="min-h-[20vh]" v-else />
      </div>
      <VanCell title="查看此人上传作品" icon="search-o" is-link v-if="bika.user.User.is(user)"
        @click="user && $router.force.push(`/search?mode=uploader&keyword=${user._id}`)" />
    </div>
  </FloatPopup>
</template>