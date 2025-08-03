<script setup lang='ts'>
import { onUnmounted, ref } from 'vue'
import { AutoPlayConfig, baseAutoPlayConfig } from './comicView.helper'

const $emit = defineEmits<{
  submit: [config: AutoPlayConfig]
}>()

const autoPlayConfig = ref<AutoPlayConfig>(baseAutoPlayConfig)
onUnmounted(() => {
  autoPlayConfig.value = baseAutoPlayConfig
})
const submit = () => {
  $emit('submit', autoPlayConfig.value)
}
</script>

<template>
  <VanForm @submit="submit" class="size-full">
    <div class="font-bold text-lg text-[--p-color] w-full p-1">自动翻页</div>
    <VanField name="enable" label="启用">
      <template #input>
        <VanSwitch v-model="autoPlayConfig.enable" />
      </template>
    </VanField>
    <VanField name="speedSecond" label="翻页速度(s)">
      <template #input>
        <VanStepper :min="1" v-model="baseAutoPlayConfig.speedSecond" />
      </template>
    </VanField>
    <VanField name="reverse" label="反向翻页">
      <template #input>
        <VanSwitch v-model="autoPlayConfig.reverse" />
      </template>
    </VanField>
    <div class="m-4">
      <VanButton round block type="primary" native-type="submit">
        应用
      </VanButton>
    </div>
  </VanForm>
</template>