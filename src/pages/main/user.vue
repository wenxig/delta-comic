<script setup lang='ts'>
import { onUnmounted } from 'vue'
import { createLoadingMessage } from '@/utils/message'
import { useBikaStore, useJmStore } from '@/stores'
import { until } from '@vueuse/core'
import { useConfig } from '@/config'
const config = useConfig()
const bikaStore = useBikaStore()
const jmStore = useJmStore()
if (bikaStore.user.profile.isLoading.value || jmStore.user.profile.isLoading.value) {
  const loading = createLoadingMessage()
  until(() => bikaStore.user.profile.isLoading.value || jmStore.user.profile.isLoading.value).not.toBeTruthy().then(() => loading.success())
  onUnmounted(() => loading.destroy())
}

const $window = window
</script>

<template>
  <div class="w-full pt-safe bg-(--van-background-2)"></div>
  <div class="w-full h-10 flex justify-end items-center bg-(--van-background-2)">
    <VanIcon color="var(--van-text-color-2)" class="mx-2" @click="config['app.darkMode'] = !config['app.darkMode']">
      <svg v-if="config['app.darkMode']" xmlns="http://www.w3.org/2000/svg" class="w-7"
        xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24">
        <path d="M12 3h.393a7.5 7.5 0 0 0 7.92 12.446A9 9 0 1 1 12 2.992z" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
      <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-7" xmlns:xlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 24 24">
        <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="4"></circle>
          <path d="M3 12h1m8-9v1m8 8h1m-9 8v1M5.6 5.6l.7.7m12.1-.7l-.7.7m0 11.4l.7.7m-12.1-.7l-.7.7"></path>
        </g>
      </svg>
    </VanIcon>
  </div>
  <BikaUserInfo class="h-20" :user="bikaStore.user.profile.data.value" hide-slogan>
    <div class="absolute text-xs text-(--van-text-color-2) top-1/2 right-3 -translate-y-1/2">编辑
      <VanIcon name="arrow" />
    </div>
  </BikaUserInfo>
  <JmUserInfo class="h-20" :user="jmStore.user.profile.data.value?.toCommonUser()" small-badges
    @click="$router.force.push('/user/edit')">
    <div class="absolute text-xs text-(--van-text-color-2) top-1/2 right-3 -translate-y-1/2">编辑
      <VanIcon name="arrow" />
    </div>
  </JmUserInfo>
  <VanRow
    class="w-full bg-(--van-background-2) h-[4rem] *:*:flex *:*:flex-col *:*:justify-center *:*:items-center *:*:*:first:text-lg *:*:*:last:text-xs *:*:*:last:text-(--van-text-color-2) py-2">
    <VanCol span="8">
      <div class="van-hairline--right">
        <span>123</span>
        <span>收藏</span>
      </div>
    </VanCol>
    <VanCol span="8">
      <div>
        <span>456</span>
        <span>关注</span>
      </div>
    </VanCol>
    <VanCol span="8">
      <div class="van-hairline--left">
        <span>789</span>
        <span>获赞</span>
      </div>
    </VanCol>
  </VanRow>
  <div class="bg-(--van-background-2) !text-xs w-full h-[calc(100%-2.5rem-5rem-4rem)] overflow-y-auto">
    <div class="w-full h-20 flex justify-around items-center">
      <div @click="$router.push('/user/history')"
        class="flex flex-col justify-center items-center van-haptics-feedback">
        <VanIcon name="clock-o" size="2rem" color="var(--bili-blue)" />
        <span class="mt-1 text-(--van-text-color)">历史记录</span>
      </div>
      <div @click="$router.push('/user/favourt')"
        class="flex flex-col justify-center items-center van-haptics-feedback">
        <VanIcon name="star-o" size="2rem" color="var(--bili-blue)" />
        <span class="mt-1 text-(--van-text-color)">我的收藏</span>
      </div>
      <div @click="$router.push('/user/image')" class="flex flex-col justify-center items-center van-haptics-feedback">
        <VanIcon name="photo-o" size="2rem" color="var(--bili-blue)" />
        <span class="mt-1 text-(--van-text-color)">图片收藏</span>
      </div>
      <div @click="$router.push('/user/comment')"
        class="flex flex-col justify-center items-center van-haptics-feedback">
        <VanIcon name="chat-o" size="2rem" color="var(--bili-blue)" />
        <span class="mt-1 text-(--van-text-color)">我的评论</span>
      </div>
    </div>
    <VanCell title="设置" is-link @click="$router.force.push('/setting')" />
    <VanCell title="青少年模式" @click="$window.close()" is-link />
  </div>
</template>
<style scoped lang='scss'>
:deep(.n-statistic__label),
:deep(.n-statistic-value) {
  text-align: center;
}
</style>