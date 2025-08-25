<script setup lang='ts'>
import { useConfig } from '@/config'
import { shallowRef } from 'vue'
import Popup from '@/components/popup.vue'
import { cosavSorterValue } from '@/utils/translator'
const config = useConfig()
const showSorter = shallowRef(false)
const _sortValue = shallowRef([config['cosav.search.sort']])
defineExpose({
  show() {
    showSorter.value = true
  }
})
</script>

<template>
  <Popup v-model:show="showSorter" round position="bottom">
    <VanPicker :columns="cosavSorterValue" @cancel="showSorter = false"
      @confirm="v => { console.log('sorter selected:', v); config['cosav.search.sort'] = v.selectedValues[0]; showSorter = false; $emit('reload') }"
      v-model="_sortValue" />
  </Popup>
</template>