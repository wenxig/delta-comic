<script setup lang='ts'>
import { useSearchMode } from '@/utils/translator'

const $props = defineProps<{
  text: string
}>()
const searchMode = useSearchMode(() => $props.text)
</script>

<template>
  <VanTag type="primary" v-if="searchMode != 'keyword'" class="text-nowrap">
    <VanIcon :name="searchMode == 'author' ? 'user-o' :
      searchMode == 'tag' ? 'apps-o' :
        searchMode == 'category' ? 'apps-o' :
          searchMode == 'translator' ? 'user-o' :
            searchMode == 'uploader' ? 'user-o' :
              (searchMode == 'id' || searchMode == 'pid') ? 'description-o' : ''" size="0.8rem" />
    {{ searchMode == 'author' ? '作者' :
      searchMode == 'tag' ? '标签' :
        searchMode == 'category' ? '分类' :
          searchMode == 'translator' ? '汉化' :
            searchMode == 'uploader' ? '骑士' :
              (searchMode == 'id' || searchMode == 'pid') ? 'ID' : ''
            }}
  </VanTag>
</template>