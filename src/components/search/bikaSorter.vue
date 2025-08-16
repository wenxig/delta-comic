<script setup lang='ts'>
import { useConfig } from '@/config'
import { bikaSorterValue } from '@/utils/translator'
import { shallowRef } from 'vue'
import Popup from '@/components/popup.vue'
const config = useConfig()
const showSorter = shallowRef(false)
const _sortValue = shallowRef([config['bika.search.sort']])
defineExpose({
  show() {
    showSorter.value = true
  }
})
</script>

<template>
  <Popup v-model:show="showSorter" round position="bottom">
    <van-picker :columns="bikaSorterValue" @cancel="showSorter = false"
      @confirm="v => { console.log('sorter selected:', v); config['bika.search.sort'] = v.selectedValues[0]; showSorter = false; $emit('reload') }"
      v-model="_sortValue" />
  </Popup>
</template>