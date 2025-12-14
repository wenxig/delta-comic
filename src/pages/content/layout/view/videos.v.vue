<script setup lang='ts'>
import { computed, onBeforeUnmount, shallowRef, useTemplateRef } from 'vue'
import { watch } from 'vue'
import { Comp, uni, Utils } from 'delta-comic-core'
import { ScreenOrientation } from '@capacitor/screen-orientation'
import { MediaPlayerElement } from 'vidstack/elements'
import { MediaOrientationLockRequestEvent } from 'vidstack'
import { Capacitor } from '@capacitor/core'
import "vidstack/icons"
import "vidstack/bundle"
import "hls.js"
import { ArrowBackIosRound, PauseRound, PlayArrowRound } from '@vicons/material'
import { LikeOutlined } from '@vicons/antd'
import { useRouter } from 'vue-router'

const $props = defineProps<{
  page: uni.content.ContentVideoPage
}>()
const isFullScreen = defineModel<boolean>('isFullScreen', { required: true })
const player = useTemplateRef<MediaPlayerElement>('player')
const union = computed(() => $props.page.union.value)
const videos = computed(() => $props.page.videos.content.data.value ?? [])
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
}, { immediate: true })

watch(videos, videos => {
  if (!player.value) return
  player.value.textTracks.clear()
  for (const textTrack of videos.textTrack ?? [])
    player.value.textTracks.add(textTrack)
}, { immediate: true })

const $router = useRouter()
$router.beforeEach(()=>{
  unlockScreenOrientation()
})

const handleScreenScreenOrientationLock = async (config: MediaOrientationLockRequestEvent) => {
  config.stopImmediatePropagation()
  if (!Capacitor.isNativePlatform()) return
  await ScreenOrientation.unlock()
  return ScreenOrientation.lock({
    orientation: config.detail
  })
}
const unlockScreenOrientation = async () => {
  if (!Capacitor.isNativePlatform()) return
  await ScreenOrientation.unlock()
  return ScreenOrientation.lock({
    orientation: "portrait-primary"
  })
}
window.$api.player = player
onBeforeUnmount(() => {
  isFullScreen.value = false
  player.value?.destroy()
  unlockScreenOrientation()
})

const src = shallowRef<uni.content.VideoConfig[number]>()
watch(videos, videos => {
  src.value = videos[0]
}, { immediate: true })

const isLiked = shallowRef(union.value?.isLiked ?? false)
const likeSignal = new Utils.request.SmartAbortController()
const handleLike = async () => {
  likeSignal.abort()
  try {
    union.value?.like(likeSignal.signal)
      .then(v => isLiked.value = v)
  } catch (error) {
    console.error('liked fail')
  }
}

defineSlots<{
  menu(): any
}>()
</script>

<template>
  <NSpin :show="!union" class="size-full *:first:size-full relative bg-black">
    <media-player :title="union?.title" class="size-full relative !z-1" :src playsinline ref="player"
      @media-orientation-unlock-request="unlockScreenOrientation()" keep-alive
      @media-orientation-lock-request="handleScreenScreenOrientationLock($event)"
      @fullscreen-change="isFullScreen = $event.detail">
      <media-provider class="bg-black"></media-provider>
      <Comp.Await v-if="union" :promise="() => union!.$cover.getUrl()" v-slot="{ result }">
        <media-poster
          class="absolute inset-0 block h-full w-full rounded-md bg-black opacity-0 transition-opacity data-[visible]:opacity-100 [&>img]:h-full [&>img]:w-full [&>img]:object-cover"
          :src="result" alt="封面" />
      </Comp.Await>
      <media-controls v-if="isFullScreen"
        class="pointer-events-none absolute text-white inset-0 z-10 flex h-full w-full flex-col bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity data-[visible]:opacity-100">
        <media-controls-group
          class="pointer-events-auto flex size-full items-center !h-[56px] relative bg-gradient-to-b from-black/40 from-50% to-transparent">
          <NIcon color="white" size="1.5rem" class="mr-2 ml-3" @click="$router.back()">
            <ArrowBackIosRound />
          </NIcon>
          <media-title class="text-[15px] text-nowrap van-ellipsis w-6/10 "></media-title>
          <div class="flex justify-around items-center h-full absolute right-0 gap-6 pr-3 **:!text-white *:!p-0">
            <Comp.ToggleIcon size="23px" v-model="isLiked" @click="handleLike" :icon="LikeOutlined" />

            <FavouriteSelect :item="page.union.value" v-if="page.union.value" plain />

            <media-pip-button>
              <media-icon type="picture-in-picture" class="size-7 block group-data-[active]:hidden"></media-icon>
              <media-icon type="picture-in-picture-exit" class="hidden size-6 group-data-[active]:block"></media-icon>
            </media-pip-button>

            <media-icon type="menu-vertical" class="size-7 block z-100 mr-2"></media-icon>
          </div>
        </media-controls-group>
        <media-controls-group class="!pointer-events-none flex w-full items-center px-2 flex-1 relative">
          <div class="flex items-center text-sm font-medium absolute bottom-3 left-6 text-white/80">
            <media-time class="time" type="current"></media-time>
            <div class="mx-1">/</div>
            <media-time class="time" type="duration"></media-time>
          </div>
        </media-controls-group>
        <media-controls-group
          class="pointer-events-auto flex w-full justify-around items-center !h-[56px] flex-col bg-gradient-to-t from-black/20 from-40% to-transparent">
          <media-time-slider
            class="group relative inline-flex h-4 w-[calc(100%-60px)] cursor-pointer touch-none select-none items-center outline-none aria-hidden:hidden">
            <!-- Track -->
            <div class="relative z-0 h-[3px] w-full rounded-sm bg-white/30">
              <!-- Track Fill -->
              <div class="absolute z-10 h-full w-[var(--slider-fill)] rounded-sm bg-(--p-color) will-change-[width]">
              </div>
              <!-- Progress -->
              <div class="absolute h-full w-[var(--slider-progress)] rounded-sm bg-white/50 will-change-[width]">
              </div>
            </div>
            <!-- Thumb -->
            <div
              class="absolute left-[var(--slider-fill)] top-1/2 z-20 h-[12px] w-[14px] -translate-x-1/2 -translate-y-1/2 rounded-sm bg-white transition-opacity will-change-[left]">
            </div>
          </media-time-slider>
          <div class="flex w-full h-[56px] items-center pl-3">
            <media-play-button
              class="group relative flex size-10 cursor-pointer mr-1 items-center justify-center rounded-md outline-none text-white">
              <PauseRound class="size-10 group-data-[paused]:hidden" type="play" />
              <PlayArrowRound class="hidden size-10 group-data-[paused]:block" type="play" />
            </media-play-button>
          </div>

          <div class="flex h-[30px] absolute right-6 items-end gap-4">
            <slot name="menu"></slot>
            <VanPopover @select="q => src = q.label" placement="top-end" show theme="dark"
              :actions="videos.map((v, index) => ({ text: `线路: ${index + 1}`, label: v }))" teleport="#popups">
              <template #reference>
                <NButton color="#fff" strong size="large" text>线路:
                  {{videos.findIndex(v => v == src) + 1}}
                </NButton>
              </template>
            </VanPopover>
          </div>

        </media-controls-group>
      </media-controls>

      <media-controls v-else
        class="pointer-events-none absolute inset-0 z-10 flex size-full flex-col bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity data-[visible]:opacity-100">
        <media-controls-group
          class="pointer-events-auto flex w-full items-center px-2 justify-end h-[calc(56px+var(--safe-area-inset-top))] pt-safe gap-3 bg-gradient-to-b from-black to-transparent ">
          <media-pip-button>
            <media-icon type="picture-in-picture" class="size-7 block group-data-[active]:hidden"></media-icon>
            <media-icon type="picture-in-picture-exit" class="hidden size-7 group-data-[active]:block"></media-icon>
          </media-pip-button>

          <media-icon type="menu-vertical" class="size-7 block z-100 mr-2"></media-icon>
        </media-controls-group>
        <div class="flex-1"></div>
        <media-controls-group class="pointer-events-auto flex w-full items-center px-2">

        </media-controls-group>
        <div class="flex-1"></div>
        <media-controls-group class="pointer-events-auto flex w-full justify-around items-center">
          <media-play-button
            class="group relative flex size-10 cursor-pointer mr-1 items-center justify-center rounded-md outline-none text-white">
            <PauseRound class="size-10 group-data-[paused]:hidden" type="play" />
            <PlayArrowRound class="hidden size-10 group-data-[paused]:block" type="play" />
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
          <div class="w-18"></div>
        </media-controls-group>
      </media-controls>

      <media-captions
        class="absolute inset-0 bottom-2 z-10 select-none break-words opacity-0 transition-[opacity,bottom] duration-300 media-captions:opacity-100 media-controls:bottom-[85px] media-preview:opacity-0"></media-captions>

      <media-gesture action="toggle:controls" event="pointerup"></media-gesture>
      <media-gesture action="toggle:paused" class="absolute top-0 left-0 size-full" event="dblclick"></media-gesture>

      <div class="pointer-events-none absolute inset-0 z-50 flex h-full w-full items-center justify-center">
        <media-spinner
          class="text-white opacity-0 transition-opacity duration-200 ease-linear media-buffering:animate-spin media-buffering:opacity-100 [&>[data-part='track']]:opacity-25"
          size="23" track-width="8"></media-spinner>
      </div>
    </media-player>
  </NSpin>
</template>
<style scoped lang='css'>
:deep(*) {
  --van-popover-dark-background: rgba(0, 0, 0, 0.5) !important;

  &.van-popover__content {
    backdrop-filter: blur(10px);
  }
}

:deep(video) {
  height: 100%;
  width: 100%;
  aspect-ratio: unset;
}
</style>