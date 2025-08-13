<script setup lang='ts'>
import { shallowRef } from 'vue'
import { createLoadingMessage } from '@/utils/message'
import Popup from '@/components/popup.vue'
import { FieldInstance } from 'vant'
import { useConfig } from '@/config'
import { bika } from '@/api/bika'
const config = useConfig()

const show = shallowRef(false)

const input = shallowRef('')
const $props = defineProps<{
  aimId?: number
  mode: 'comics' | 'comment'
  class?: any
}>()
const $emit = defineEmits<{
  afterSend: []
}>()

const isSubmitting = shallowRef(false)
const submit = async () => {
  if (input.value == '') return window.$message.info('评论内容不能为空')
  isSubmitting.value = true
  const loading = createLoadingMessage('发送中')
  try {
    if (!$props.aimId) throw false
    if ($props.mode == 'comment') {
    //   await bika.api.comment.sendChildComment($props.aimId, input.value)
    // } else {
    //   await bika.api.comment.sendComment($props.aimId, input.value)
    }
    $emit('afterSend')
    loading.success()
    show.value = false
    input.value = ''
  } catch (err) {
    console.error(err, $props.aimId, $props.mode)
    loading.fail()
  }
  isSubmitting.value = false
}
const inputEl = shallowRef<FieldInstance>()
defineExpose({
  inputEl
})
</script>

<template>
  <Popup v-model:show="show" position="bottom" class="w-full bg-(--van-background-2) pb-1" round>
    <VanField type="textarea" class="w-full min-h-[30vh]" autosize v-model="input" placeholder="写下你的留言吧..."
      @click="inputEl?.focus()" ref="inputEl" />
    <div class="w-full h-8 flex items-center justify-end mt-1 pr-1">
      <NButton round type="primary" :loading="isSubmitting" @click="submit()">
        提交
      </NButton>
    </div>
  </Popup>
  <div class="w-full h-10 bg-(--van-background-2) flex justify-center items-center van-hairline--top" :class @click="async () => {
    show = true
    await $nextTick()
    inputEl?.focus()
  }">
    <div :class="[config['app.darkMode'] ? 'bg-[#333] text-[#666]' : 'bg-gray-100 text-gray-300']"
      class="w-[90%] h-[80%] rounded-full px-2 flex items-center !text-xs van-ellipsis">
      {{ input || '写下你的留言吧...' }}
    </div>
  </div>
</template>