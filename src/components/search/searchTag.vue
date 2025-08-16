<script setup lang='ts'>
import { useSearchMode } from '@/utils/translator'

const $props = defineProps<{
  text: string
}>()
const searchMode = useSearchMode(() => $props.text)
</script>

<template>
  <VanTag type="primary" v-if="searchMode != 'keyword'" class="text-nowrap">
    <template v-if="searchMode == 'tag'">
      <VanIcon name="apps-o" size="0.8rem" />
      标签
    </template>
    <template v-if="searchMode == 'category'">
      <VanIcon name="apps-o" size="0.8rem" />
      分类
    </template>
    <template v-if="searchMode == 'uploader'">
      <VanIcon name="user-o" size="0.8rem" />
      上传
    </template>
    <template v-if="['jid', 'pid'].includes(searchMode)">
      <VanIcon name="description-o" size="0.8rem" />
      ID
    </template>
  </VanTag>
</template>