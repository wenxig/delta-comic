<script setup lang='ts'>
import { useSearchMode } from '@/utils/translator'

const $props = defineProps<{
  text: string
}>()
const searchMode = useSearchMode(() => $props.text)
</script>

<template>
  <VanTag type="primary" v-if="searchMode != 'keyword'" class="text-nowrap">
    <VanIcon :name="searchMode == 'tag' ? 'apps-o' :
      searchMode == 'category' ? 'apps-o' :
        searchMode == 'uploader' ? 'user-o' :
          (searchMode == 'jid' || searchMode == 'pid') ? 'description-o' : ''" size="0.8rem" />
    {{
      searchMode == 'tag' ? '标签' :
        searchMode == 'category' ? '分类' :
          searchMode == 'uploader' ? '骑士' :
            (searchMode == 'jid' || searchMode == 'pid') ? 'ID' : ''
    }}
  </VanTag>
</template>