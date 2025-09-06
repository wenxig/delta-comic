<script setup lang='ts'>
import { computed } from 'vue'
import userIcon from '@/assets/images/userIcon.webp?url'
import { userCharactersTranslator } from '@/utils/translator'
import { bika } from '@/api/bika'
const $props = defineProps<{
  user: bika.user.User | undefined
  hideSlogan?: boolean
  class?: any
  small?: boolean
}>()
const exp = computed(() => $props.user?.exp ?? 0)
</script>

<template>
  <NThing :class class="bg-(--van-background-2) overflow-hidden relative w-full">
    <template #avatar v-if="!small">
      <Image :src="$props.user?.$avatar" :fallback="userIcon" previewable fit="cover" class="size-16 mt-1 ml-1" round />
    </template>
    <template #header>
      <div class="mt-2 -mb-2 flex items-center">
        {{ user?.name }}
        <div class="flex mx-1 items-center text-(--nui-primary-color)" v-if="user?.gender == 'm'">
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="w-4"
            viewBox="0 0 1024 1024">
            <path
              d="M874 120H622c-3.3 0-6 2.7-6 6v56c0 3.3 2.7 6 6 6h160.4L583.1 387.3c-50-38.5-111-59.3-175.1-59.3c-76.9 0-149.3 30-203.6 84.4S120 539.1 120 616s30 149.3 84.4 203.6C258.7 874 331.1 904 408 904s149.3-30 203.6-84.4C666 765.3 696 692.9 696 616c0-64.1-20.8-124.9-59.2-174.9L836 241.9V402c0 3.3 2.7 6 6 6h56c3.3 0 6-2.7 6-6V150c0-16.5-13.5-30-30-30zM408 828c-116.9 0-212-95.1-212-212s95.1-212 212-212s212 95.1 212 212s-95.1 212-212 212z"
              fill="currentColor"></path>
          </svg>
        </div>
        <div class="flex mx-1 items-center text-(--nui-primary-color)" v-else-if="user?.gender == 'f'">
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="w-4"
            viewBox="0 0 1024 1024">
            <path
              d="M712.8 548.8c53.6-53.6 83.2-125 83.2-200.8c0-75.9-29.5-147.2-83.2-200.8C659.2 93.6 587.8 64 512 64s-147.2 29.5-200.8 83.2C257.6 200.9 228 272.1 228 348c0 63.8 20.9 124.4 59.4 173.9c7.3 9.4 15.2 18.3 23.7 26.9c8.5 8.5 17.5 16.4 26.8 23.7c39.6 30.8 86.3 50.4 136.1 57V736H360c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h114v140c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V812h114c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8H550V629.5c61.5-8.2 118.2-36.1 162.8-80.7zM512 556c-55.6 0-107.7-21.6-147.1-60.9C325.6 455.8 304 403.6 304 348s21.6-107.7 60.9-147.1C404.2 161.5 456.4 140 512 140s107.7 21.6 147.1 60.9C698.4 240.2 720 292.4 720 348s-21.6 107.7-60.9 147.1C619.7 534.4 567.6 556 512 556z"
              fill="currentColor"></path>
          </svg>
        </div>
        <div class="flex mx-1 items-center text-(--nui-primary-color)" v-else>
          <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="w-4"
            viewBox="0 0 640 512">
            <path
              d="M304 384h272c17.67 0 32-14.33 32-32c0-123.71-100.29-224-224-224V64h176c8.84 0 16-7.16 16-16V16c0-8.84-7.16-16-16-16H144c-8.84 0-16 7.16-16 16v32c0 8.84 7.16 16 16 16h176v64H112L68.8 70.4C65.78 66.37 61.03 64 56 64H16.01C5.6 64-2.04 73.78.49 83.88L32 192l160 64l86.4 115.2A31.992 31.992 0 0 0 304 384zm112-188.49C478.55 208.3 528.03 257.44 540.79 320H416V195.51zm219.37 263.3l-22.15-22.2c-6.25-6.26-16.24-6.1-22.64.01c-7.09 6.77-13.84 11.25-24.64 11.25H240c-8.84 0-16 7.18-16 16.03v32.06c0 8.85 7.16 16.03 16 16.03h325.94c14.88 0 35.3-.47 68.45-29.52c7.02-6.14 7.57-17.05.98-23.66z"
              fill="currentColor"></path>
          </svg>
        </div>
        <span class="mr-1 text-xs text-(--nui-primary-color) font-normal">Lv{{ user?.level }}</span>
      </div>
    </template>
    <template #description>
      <div class="flex flex-wrap w-full pb-1 *:mr-1 *:mt-1">
        <VanTag type="primary">
          {{ user?.title }}
        </VanTag>
        <VanTag plain type="primary" v-for="c of user?.characters">
          {{ userCharactersTranslator(c) }}
        </VanTag>
      </div>
      <div class="flex !w-[60%] items-center">
        <span class="mr-1 no-color-change-transition text-xs text-(--van-text-color-2)">{{ exp }}/{{ user?.$needExp
          ?? 0 }}</span>
        <NProgress color="var(--nui-primary-color)" type="line" status="info"
          :percentage="(exp / (user?.$needExp ?? exp)) * 100" :show-indicator="false" />
      </div>
    </template>
    <Text :text="user?.slogan" v-if="!hideSlogan && !small"
      class="!text-(--van-text-color-2) !text-xs w-[calc(100%-8px*2)] p-2" />
    <slot />
  </NThing>
</template>