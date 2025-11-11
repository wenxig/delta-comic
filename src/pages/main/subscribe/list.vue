<script setup lang='ts'>
import { Comp, uni, Utils } from 'delta-comic-core'
import Card from './card.vue'

defineProps<{
  source: Utils.data.RStream<uni.item.Item>
}>()
defineEmits<{
  unsubscribe: []
}>()
</script>

<template>
  <Comp.Waterfall :source :padding="0" :col="1" :gap="4" v-slot="{ item }">
    <Card :item @unsubscribe="$emit('unsubscribe')" />
  </Comp.Waterfall>
</template>