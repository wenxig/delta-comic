<script setup lang='ts'>
import { computed, onUnmounted, shallowRef, useTemplateRef } from 'vue'
import { watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { Comp, uni, Utils } from 'delta-comic-core'
import { ScreenOrientation } from '@capacitor/screen-orientation'
import { MediaPlayerElement } from 'vidstack/elements'
import { MediaOrientationLockRequestEvent, PlayerSrc } from 'vidstack'
import { Capacitor } from '@capacitor/core'
import "vidstack/icons"
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
            <media-controls
              class="pointer-events-none absolute inset-0 z-10 flex h-full w-full flex-col bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity data-[visible]:opacity-100">
              <media-controls-group class="pointer-events-auto flex w-full items-center px-2">
      
              </media-controls-group>
              <div class="flex-1"></div>
              <media-controls-group class="pointer-events-auto flex w-full items-center px-2">
      
              </media-controls-group>
              <div class="flex-1"></div>
              <media-controls-group class="pointer-events-auto flex w-full justify-around items-center px-2">
                <media-play-button
                  class="group relative flex size-10 cursor-pointer items-center justify-center rounded-md outline-none text-white">
                  <media-icon type="play" class="hidden size-8 group-data-[paused]:block"></media-icon>
                  <media-icon type="pause" class="size-8 group-data-[paused]:hidden"></media-icon>
                </media-play-button>
      
                <media-time-slider
                  class="group relative mx-[7.5px] inline-flex h-10 w-full cursor-pointer touch-none select-none items-center outline-none aria-hidden:hidden">
                  <!-- Track -->
                  <div class="relative z-0 h-[5px] w-full rounded-sm bg-white/30">
                    <!-- Track Fill -->
                    <div class="absolute z-10 h-full w-[var(--slider-fill)] rounded-sm bg-(--p-color) will-change-[width]">
                    </div>
                    <!-- Progress -->
                    <div class="absolute h-full w-[var(--slider-progress)] rounded-sm bg-white/50 will-change-[width]">
                    </div>
                  </div>
                  <!-- Thumb -->
                  <div
                    class="absolute left-[var(--slider-fill)] top-1/2 z-20 h-[15px] w-[17px] -translate-x-1/2 -translate-y-1/2 rounded-sm bg-white transition-opacity will-change-[left]">
                  </div>
                </media-time-slider>
                <div class="w-10"></div>
              </media-controls-group>
            </media-controls>


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