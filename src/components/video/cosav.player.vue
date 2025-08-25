<script setup lang='ts'>
import { cosav } from "@/api/cosav"
import { useConfig } from "@/config"
import "vidstack/bundle"
import { MediaPlayer as MediaPlayerEl } from "vidstack"
import { computed, useTemplateRef, watch } from "vue"
import { CosavContentPage } from "@/stores/content"
import { onBeforeRouteLeave } from "vue-router"

const $props = defineProps<{
  video?: cosav.video.FullVideo
  page: CosavContentPage
  id: string
}>()
const config = useConfig()
const src = computed(() => $props.video?.video_url_vip.concat($props.video.video_url)[config["cosav.lineIndex"]])
const player = useTemplateRef<MediaPlayerEl>('player')
defineExpose({
  player
})
const isFullScreen = defineModel<boolean>('isFullScreen', { required: true })
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
})
onBeforeRouteLeave(() => {
  if (isFullScreen.value) {
    isFullScreen.value = false
    return false
  }
})

</script>

<template>
  <NSpin :show="!$props.video || !src" class="size-full *:first:size-full relative bg-black">
    <media-player :title="$props.video.title" class="size-full aspect-video relative !z-1" :src="{
      src,
      type: 'application/vnd.apple.mpegurl'
    }" playsinline ref="player" @fullscreen-change="isFullScreen = $event.detail" v-if="$props.video && src">
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
    <Image class="absolute size-full top-0" fit="contain" v-if="!$props.video || !src"
      :src="page.preload.value?.photo || `${config['cosav.proxy.resource']}/media/videos/tmb/${id}/0.jpg`" />
  </NSpin>
</template>