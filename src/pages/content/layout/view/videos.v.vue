<script setup lang='ts'>
import { computed, onUnmounted, shallowRef, useTemplateRef } from 'vue'
import { watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { Comp, uni, Utils } from 'delta-comic-core'
import { ScreenOrientation } from '@capacitor/screen-orientation'
import { MediaPlayerElement } from 'vidstack/elements'
import { MediaOrientationLockRequestEvent, PlayerSrc } from 'vidstack'
import { Capacitor } from '@capacitor/core'
import "vidstack/bundle"
import "hls.js"
const $props = defineProps<{
  page: uni.content.ContentPage & {
    videos: Utils.data.PromiseWithResolvers<string[]>
    videoType: string
  }
}>()
const isFullScreen = defineModel<boolean>('isFullScreen', { required: true })
const player = useTemplateRef<MediaPlayerElement>('player')
defineExpose({
  player
})
watch(player, (player, _, onCleanup) => {
  onCleanup(watch(isFullScreen, isFullScreen => {
    if (player) {
      console.log('<CosavPlayer> isFullScreen change', isFullScreen)
      if (isFullScreen) {
        player.enterFullscreen()
      } else {
        player.exitFullscreen()
      }
    }
  }, {
    immediate: true
  }))
  if (player) {
    player.currentTime
  }
})
onBeforeRouteLeave(() => {
  if (isFullScreen.value) {
    isFullScreen.value = false
    return false
  }
})

const handleScreenScreenOrientationLock = (config: MediaOrientationLockRequestEvent) => {
  config.stopImmediatePropagation()
  if (!Capacitor.isNativePlatform()) return
  ScreenOrientation.lock({
    orientation: config.detail
  })
}
const unlockScreenOrientation = () => {
  ScreenOrientation.unlock()
}
onUnmounted(() => {
  ScreenOrientation.lock({
    orientation: "portrait-primary"
  })
})

const union = computed(() => $props.page.union.value)
const forks = computed(() => $props.page.videos.content.data.value ?? [])
const src = shallowRef('')
watch(forks, forks => {
  src.value = forks[0] ?? ''
}, { immediate: true })
</script>

<template>
  <NSpin :show="!union" class="size-full *:first:size-full relative bg-black">
    <media-player :title="union?.title" class="size-full aspect-video relative !z-1" :src="({
      src,
      type: page.videoType
    } as PlayerSrc)" playsinline ref="player" @media-orientation-unlock-request="unlockScreenOrientation()"
      @media-orientation-lock-request="handleScreenScreenOrientationLock($event)"
      @fullscreen-change="isFullScreen = $event.detail">
      <media-provider></media-provider>
      <media-video-layout :translations="{
        Play: '播放',
        Pause: '暂停',
        Mute: '静音',
        Unmute: '取消静音',
        'Enter Fullscreen': '进入全屏',
        'Exit Fullscreen': '退出全屏',
        Captions: '字幕',
        Quality: '清晰度',
        Speed: '倍速',
        Settings: '设置',
        Replay: '重播',
        'Seek Forward': '快进',
        'Seek Backward': '后退',
        Download: '下载',
        LIVE: '直播',
        PiP: '画中画',
        Announcements: '公告',
        Accessibility: '辅助功能',
        AirPlay: 'AirPlay',
        Audio: '音频',
        Auto: '自动',
        Boost: '增强',
        'Caption Styles': '字幕样式',
        'Captions look like this': '字幕显示效果',
        Chapters: '章节',
        'Closed-Captions Off': '关闭字幕',
        'Closed-Captions On': '开启字幕',
        Connected: '已连接',
        Continue: '继续',
        Connecting: '正在连接',
        Default: '默认',
        Disabled: '已禁用',
        Disconnected: '已断开',
        'Display Background': '显示背景',
        'Enter PiP': '进入画中画',
        'Exit PiP': '退出画中画',
        Font: '字体',
        Family: '字体族',
        Fullscreen: '全屏',
        'Google Cast': 'Google Cast',
        'Keyboard Animations': '键盘动画',
        Loop: '循环',
        Normal: '正常',
        Off: '关闭',
        Playback: '播放',
        Seek: '跳转',
        'Skip To Live': '跳转到直播',
        Size: '大小',
        Color: '颜色',
        Opacity: '不透明度',
        Shadow: '阴影',
        Text: '文本',
        'Text Background': '文本背景',
        Track: '轨道',
        Volume: '音量',
        Reset: '重置'
      }"></media-video-layout>

      <media-time-slider>
      </media-time-slider>

    </media-player>
    <Comp.Image class="absolute size-full left-0 top-0" fit="contain" :src="union?.$cover" />
  </NSpin>
</template>
<style scoped lang='css'>
:deep(*) {
  --van-popover-dark-background: rgba(0, 0, 0, 0.5) !important;

  &.van-popover__content {
    backdrop-filter: blur(10px);
  }
}
</style>