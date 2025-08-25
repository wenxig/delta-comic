<script setup lang='ts'>
import { ArrowBackRound, KeyboardArrowDownRound, PlayArrowRound, PlusRound } from '@vicons/material'
import { motion } from 'motion-v'
import { computed, shallowRef, useTemplateRef } from 'vue'
import { createReusableTemplate, useCssVar } from '@vueuse/core'
import { NScrollbar } from 'naive-ui'
import { createDateString, toCn } from '@/utils/translator'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import CosavPlayer from '@/components/video/cosav.player.vue'
import { CosavContentPage, useContentStore } from '@/stores/content'
import { uniq } from 'lodash-es'
import { UserOutlined } from '@vicons/antd'

const $route = useRoute()
const videoId = computed(() => $route.params.id.toString())

const contentStore = useContentStore()
const nowPage = computed(() => <CosavContentPage | undefined>contentStore.now)
const detail = computed(() => nowPage.value?.detail.content.data.value)
const preload = computed(() => nowPage.value?.preload.value)
const pid = computed(() => nowPage.value?.pid.content.data.value)

const tags = computed(() => preload.value?.tags.concat(preload.value.$cos_role, preload.value.$cos_works) ?? [])


const $router = useRouter()
const showTitleFull = shallowRef(false)
const [TitleTemp, TitleComp] = createReusableTemplate()
const isScrolled = shallowRef(false)

const appStore = useAppStore()
const view = useTemplateRef('view')

const isShowAuthorSelect = shallowRef(false)
const previewUser = useTemplateRef('previewUser')


const scrollbar = useTemplateRef('scrollbar')

const safeHeightTopCss = useCssVar('--safe-area-inset-top')
const safeHeightTop = computed(() => Number(safeHeightTopCss.value?.match(/\d+/)?.[0]))

const authors = computed(() => uniq([detail.value?.author, detail.value?.company].filter(Boolean)))

console.log(view)
</script>

<template>
  <NScrollbar ref="scrollbar" class="*:w-full !h-full bg-(--van-background-2)" v-if="nowPage">
    <div class="w-full h-(--safe-area-inset-top) bg-black"></div>
    <div class="bg-black text-white h-[30vh] relative flex justify-center">
      <div
        class="absolute bg-[linear-gradient(rgba(0,0,0,0.9),transparent)] z-3 pointer-events-none *:pointer-events-auto top-0 w-full flex h-14 items-center">
        <VanSticky :z-index="60">
          <div class="h-[calc(56px+var(--safe-area-inset-top))] transition-colors flex items-center w-screen pt-safe"
            :class="[isScrolled ? ' bg-(--nui-primary-color)' : 'bg-transparent']">
            <NIcon color="white" size="1.5rem" class="ml-5" @click="$router.back()">
              <ArrowBackRound />
            </NIcon>
            <NIcon color="white" size="1.5rem" class="ml-5" @click="$router.force.push('/')">
              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24">
                <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path
                    d="M19 8.71l-5.333-4.148a2.666 2.666 0 0 0-3.274 0L5.059 8.71a2.665 2.665 0 0 0-1.029 2.105v7.2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.2c0-.823-.38-1.6-1.03-2.105">
                  </path>
                  <path d="M16 15c-2.21 1.333-5.792 1.333-8 0"></path>
                </g>
              </svg>
            </NIcon>
            <div @click="scrollbar?.scrollTo({ behavior: 'smooth', top: 0, left: 0 })"
              class="size-full text-[16px] flex items-center justify-center transition-opacity"
              :class="[isScrolled || 'opacity-0']">
              <NIcon size="2.5rem">
                <PlayArrowRound />
              </NIcon>
              返回顶部
            </div>
          </div>
        </VanSticky>
      </div>
      <CosavPlayer :video="detail" ref="view" v-model:is-full-screen="appStore.isFullScreen" :id="videoId"
        :page="nowPage" />
    </div>
    <VanTabs shrink swipeable sticky :offset-top="56 + safeHeightTop" background="var(--van-background-2)"
      @scroll="({ isFixed }) => isScrolled = isFixed">
      <VanTab class="min-h-full relative van-hairline--top bg-(--van-background-2)" title="简介" name="info">
        <Content :source="nowPage.detail.content">
          <div class="flex items-center mt-3" @click="isShowAuthorSelect = true">
            <div class="flex flex-col w-full text-nowrap">
              <div class="-mt-0.5 van-ellipsis max-w-2/3 text-(--nui-primary-color) text-[16px] flex items-center pl-2">
                <span v-for="author of authors" class="mr-0.5 flex items-center">
                  <NIcon class="mr-0.5 not-first:ml-1" size="25px">
                    <UserOutlined />
                  </NIcon>
                  <span>{{ author }}</span>
                </span>
              </div>
            </div>
            <NButton round type="primary" class="!absolute right-3" size="small" @click.stop>
              <template #icon>
                <NIcon>
                  <PlusRound />
                </NIcon>
              </template>
              关注
            </NButton>
            <Popup v-model:show="isShowAuthorSelect" round class="min-h-1/3" position="bottom">
              <slot name="searchPopup" :previewUser="previewUser" />
              <PreviewUser ref="previewUser" />
              <VanCell v-for="author of authors" center :title="author" is-link
                @click="$router.force.push(`/search?keyword=${author}&mode=keyword`)">
                <template #icon>
                  <NIcon size="30px" class="mr-1.5">
                    <UserOutlined />
                  </NIcon>
                </template>
              </VanCell>
            </Popup>
          </div>
          <div class="w-[95%] mx-auto mt-2">
            <div class="flex relative h-fit">
              <div class="text-[17px] font-[460] w-[89%] relative">
                <TitleTemp>
                  <div class="text-xs mt-1 font-light flex text-(--van-text-color-2) *:flex *:items-center gap-1">
                    <div class="text-(--van-text-color-2) text-xs flex gap-1 items-center ">
                      <span>
                        <VanIcon class="mr-0.5 " name="eye-o" size="14px" />
                        <span>{{ detail?.$viewnumber }}</span>
                      </span>
                      <span>
                        <span>{{ createDateString(detail?.$adddate) }}</span>
                      </span>
                    </div>
                  </div>
                </TitleTemp>
                <AnimatePresence>
                  <motion.div :initial="{ opacity: 0 }" :exit="{ opacity: 0 }" key="info" :animate="{ opacity: 1 }"
                    v-if="!showTitleFull" class="flex flex-col absolute top-0 van-ellipsis w-full">
                    <span @click="showTitleFull = !showTitleFull">
                      {{ preload?.title }}
                    </span>
                    <TitleComp />
                  </motion.div>
                </AnimatePresence>
                <NCollapseTransition :show="showTitleFull" class="!w-[calc(100%+2rem)]">
                  <span @click="showTitleFull = !showTitleFull" class="w-[calc(100%-2rem)]">
                    {{ preload?.title }}
                  </span>
                  <TitleComp />
                  <div class="flex  font-light text-(--van-text-color-2) justify-start text-xs mt-0.5">
                    <div class="mr-2">
                      CV{{ pid }}
                    </div>
                  </div>
                  <div class=" mt-6 flex flex-wrap gap-2.5 *:!px-3 **:!text-xs">
                    <NButton tertiary round v-for="tag of tags.toSorted((a, b) => b.length - a.length).filter(Boolean)"
                      class="!text-(--van-gray-7)" size="small"
                      @click="$router.force.push({ path: `/search`, query: { keyword: encodeURIComponent(tag), mode: 'tag' } })">
                      {{ toCn(tag) }}
                    </NButton>
                  </div>
                </NCollapseTransition>
              </div>
              <NIcon size="2rem" color="var(--van-text-color-3)" class="absolute -top-0.5 -right-1 transition-transform"
                :class="[showTitleFull && '!rotate-180']" @click="showTitleFull = !showTitleFull">
                <KeyboardArrowDownRound />
              </NIcon>
            </div>
            <!-- action bar -->
            <div class="mt-8 mb-4 flex justify-around" v-if="preload">
              <slot name="action" />
            </div>
          </div>
          <!-- recommend -->
          <div class="van-hairline--top w-full *:bg-transparent" v-if="nowPage.recommendVideos.content.data.value">
            <VideoCard v-for="video of nowPage.recommendVideos.content.data.value" :video :height="110" />
          </div>
        </Content>
      </VanTab>
    </VanTabs>
  </NScrollbar>
</template>