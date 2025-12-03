<script setup lang='ts'>
import { Comp, uni } from 'delta-comic-core'
import { NSelect } from 'naive-ui'

const show = defineModel<boolean>('show', { required: true })
const $emit = defineEmits<{
  change: []
}>()
</script>

<template>
  <Comp.Popup v-model:show="show" position="bottom" overlay round>
    <div class="w-full min-h-60 px-2">
      <div class="pt-3 !pl-5 text-2xl mb-2">数据源更改</div>
      <div v-for="[plugin, value] in Object.entries(Object.groupBy(Array.from(uni.image.Image.fork.entries()).map(([key, forks]) => {
        const [plugin, namespace] = uni.image.Image.fork.toJSON(key)
        return {
          plugin,
          namespace,
          forks,
          active: uni.image.Image.activeFork.get(key)!,
          key
        }
      }), v => v.plugin))">
        <div class="text-lg text-(--p-color)">{{ plugin }}</div>
        <div v-for="v in value!">
          <div class="text-[14px] pl-1 -mt-1">{{ v.namespace }}</div>
          <NSelect :options="v.forks.map(v => ({ value: v, label: v }))" :value="v.active"
            @update:value="url => { uni.image.Image.activeFork.set(v.key, url); $emit('change') }" />
        </div>
      </div>
    </div>
  </Comp.Popup>
</template>