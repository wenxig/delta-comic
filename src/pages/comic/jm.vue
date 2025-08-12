<script setup lang='ts'>
import { JmComicPage, useComicStore } from '@/stores/comic'
import { ArrowBackRound, ArrowForwardIosOutlined, DrawOutlined, FullscreenRound, KeyboardArrowDownRound, PlusRound, ReportGmailerrorredRound, ShareSharp, StarFilled } from '@vicons/material'
import { motion } from 'motion-v'
import { computed, nextTick, shallowRef, useTemplateRef, watch } from 'vue'
import { createReusableTemplate } from '@vueuse/core'
import { DislikeFilled, LikeFilled } from '@vicons/antd'
import { NScrollbar, useMessage } from 'naive-ui'
import { createDateString, toCn } from '@/utils/translator'
import { useRoute, useRouter } from 'vue-router'
import ComicView from '@/components/comic/comicView.vue'
import PreviewUser from '@/components/user/previewUser.vue'
import symbol from '@/symbol'
import { jm } from '@/api/jm'
const $route = useRoute()
const $router = useRouter()
const nowPage = computed(() => <JmComicPage | undefined>comic.now)
const comicId = Number($route.params.id.toString())
const eps = computed(() => nowPage.value?.eps.content.data.value)
const epId = computed({
  get() {
    return Number($route.params.epId.toString()) || comicId
  },
  set(epId) {
    console.log('set', `/comic/${comicId}/${epId}`)
    return $router.force.replace(`/comic/${comicId}/${epId}`)
  }
})
const selectEp = computed(() => eps.value?.find(ep => ep.$id == epId.value))
const comic = useComicStore()
const detail = computed(() => nowPage.value?.detail.content.data.value)
const preload = computed(() => nowPage.value?.preload.value)
const pid = computed(() => nowPage.value?.pid.content.data.value)
const showTitleFull = shallowRef(false)
const [TitleTemp, TitleComp] = createReusableTemplate()
const shareComic = () => {
  if (!pid.value || !preload.value) return
  navigator.share({
    url: location.href,
    text: `${preload.value.name}(JM${pid.value})`,
    title: 'DeltaComic的漫画分享'
  })
}
const $message = useMessage()
const isScrolled = shallowRef(false)

const epPageContent = shallowRef<(() => Promise<string>)[]>([])

watch(epId, async (_, __, onCancel) => {
  const signal = new AbortController()
  onCancel(() => signal.abort())
  const result = await jm.api.comic.getComicPages(epId.value, signal.signal)
  epPageContent.value = result.map(img => (() => img.getUrl()))
}, { immediate: true })

const isFullScreen = shallowRef(false)
const view = useTemplateRef('view')

const isShowAuthorSelect = shallowRef(false)
// const previewUser = useTemplateRef('previewUser')

const isR18g = computed(() => false)

const scrollbar = useTemplateRef('scrollbar')
const epSelList = useTemplateRef('epSelList')
const isShowEpSelectPopup = shallowRef(false)
const openEpSelectPopup = async () => {
  scrollbar.value?.scrollTo(0, 0)
  isShowEpSelectPopup.value = true
  await nextTick()
  epSelList.value?.listInstance?.scrollTo({
    index: eps.value?.toReversed().findIndex(ep => ep.$id == epId.value)
  })
}
</script>

<template>
  <NScrollbar ref="scrollbar" class="*:w-full !h-full **:transition-colors bg-(--van-background-2)"
    :style="{ '--van-background-2': isR18g ? 'color-mix(in oklab, var(--nui-error-color-hover) 5%, transparent)' : 'var(--van-white)' }"
    v-if="nowPage">
    <div class="bg-black text-white h-[30vh] relative flex justify-center">
      <div
        class="absolute bg-[linear-gradient(rgba(0,0,0,0.9),transparent)] z-3 pointer-events-none *:pointer-events-auto top-0 w-full flex h-14 items-center">
        <VanSticky>
          <div class="h-14 transition-colors flex items-center w-[100vw]"
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
          </div>
        </VanSticky>
      </div>
      <Teleport to="#cover" :disabled="!isFullScreen">
        <ComicView ref="view" :comic="nowPage" v-model:isFullScreen="isFullScreen" :images="epPageContent"
          :nowEpOrder="epId" />
      </Teleport>
      <!-- small size menu -->
      <VanRow class="absolute bottom-0 w-full z-3 bg-[linear-gradient(transparent,rgba(0,0,0,0.9))]">
        <VanSlider :modelValue="view?.index" :min="0" inactive-color="black" class="!w-full !absolute !bottom-0"
          :max="epPageContent.length > 1 ? epPageContent.length - 1 : view?.index ?? 0 + 1">
          <template #button>
            <span></span>
          </template>
        </VanSlider>
        <VanCol span="1" offset="21">
          <NButton class="!text-3xl" @click="isFullScreen = true" text color="#fff">
            <NIcon>
              <FullscreenRound />
            </NIcon>
          </NButton>
        </VanCol>
      </VanRow>
    </div>
    <VanTabs shrink swipeable sticky :offset-top="56" background="var(--van-background-2)"
      @scroll="({ isFixed }) => isScrolled = isFixed">
      <VanTab class="min-h-full relative van-hairline--top bg-(--van-background-2)" title="简介" name="info">
        <Content :source="nowPage.detail.content">
          <div class="flex items-center mt-3" @click="isShowAuthorSelect = true">
            <div class="flex flex-col w-full text-nowrap">
              <div class="-mt-0.5 van-ellipsis max-w-2/3 text-(--nui-primary-color) text-[16px] flex items-center pl-2">
                <span v-for="author of preload?.$author" class="mr-0.5 flex items-center">
                  <NIcon class="mr-0.5 not-first:ml-1" size="25px">
                    <DrawOutlined />
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
              <PreviewUser ref="previewUser" />
              <VanCell v-for="author of preload?.$author" center :title="author" is-link
                @click="$router.force.push(`/search?keyword=${author}&mode=author`)">
                <template #icon>
                  <NIcon size="30px" class="mr-1.5">
                    <DrawOutlined />
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
                    <span>
                      <VanIcon class="mr-0.5 " name="eye-o" size="14px" />
                      <span>{{ detail?.$total_views }}</span>
                    </span>
                    <span>
                      <span>{{ createDateString(detail?.$addtime) }}</span>
                    </span>
                  </div>
                </TitleTemp>
                <AnimatePresence>
                  <motion.div :initial="{ opacity: 0 }" :exit="{ opacity: 0 }" key="info" :animate="{ opacity: 1 }"
                    v-if="!showTitleFull" class="flex flex-col absolute top-0 van-ellipsis w-full">
                    <span @click="showTitleFull = !showTitleFull">
                      {{ preload?.name }}
                    </span>
                    <TitleComp />
                  </motion.div>
                </AnimatePresence>
                <NCollapseTransition :show="showTitleFull" class="!w-[calc(100%+2rem)]">
                  <span @click="showTitleFull = !showTitleFull" class="w-[calc(100%-2rem)]">
                    {{ preload?.name }}
                  </span>
                  <TitleComp />
                  <div class="flex  font-light text-(--van-text-color-2) justify-start text-xs mt-0.5">
                    <div class="mr-2">
                      JM{{ pid }}
                    </div>
                  </div>
                  <Text class="font-[350]  mt-1 text-(--van-text-color-2) justify-start text-xs">
                    {{ detail?.description.replaceAll(symbol.r18gNotice, '') }}
                  </Text>
                  <div class=" mt-6 flex flex-wrap gap-2.5 *:!px-3 **:!text-xs">
                    <NButton tertiary round
                      v-for="category of (preload?.toUniComic().categories ?? []).concat(detail?.tags ?? []).toSorted((a, b) => b.length - a.length)"
                      type="primary"
                      @click="$router.force.push({ path: `/search`, query: { keyword: encodeURIComponent(category), mode: 'category' } })"
                      size="small">
                      {{ toCn(category) }}
                    </NButton>
                    <NButton tertiary round
                      v-for="tag of detail?.works.concat(detail.actors).toSorted((a, b) => b.length - a.length)"
                      @click="$router.force.push({ path: `/search`, query: { keyword: encodeURIComponent(tag), mode: 'tag' } })"
                      class="!text-(--van-gray-7)" size="small">
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
              <ToggleIcon size="27px" @update:model-value="v => detail && (detail.liked = v)"
                :model-value="detail?.liked ?? false" @change="jm.api.comic.likeComic(comicId)" :icon="LikeFilled">
                {{ detail?.$likes || '喜欢' }}
              </ToggleIcon>
              <ToggleIcon size="27px" :icon="DislikeFilled" @click="$message.info('个性化功能设计中')" dis-changed>
                不喜欢
              </ToggleIcon>
              <ToggleIcon size="27px" dis-changed :icon="ReportGmailerrorredRound">
                举报
              </ToggleIcon>
              <ToggleIcon size="27px" @update:model-value="v => detail && (detail.is_favorite = v)"
                :model-value="detail?.is_favorite ?? false" :icon="StarFilled">
                收藏
              </ToggleIcon>
              <ToggleIcon size="27px" @click="shareComic()" :icon="ShareSharp" dis-changed>
                分享
              </ToggleIcon>
            </div>
            <!-- ep select -->
            <div class="relative mb-4 w-full flex items-center rounded pl-3 py-2 van-haptics-feedback"
              :class="[isR18g ? 'bg-(--van-gray-1)/70' : 'bg-(--van-gray-2)']" v-if="eps && eps.length > 1"
              @click="openEpSelectPopup">
              <span>选集</span>
              <span class="mx-0.5">·</span>
              <span class="max-w-1/2 van-ellipsis">{{ selectEp?.name ?? `第${selectEp?.$id}Ep` }}</span>
              <span class="absolute right-2 text-xs text-(--van-text-color-2) flex items-center">
                <span>{{ selectEp?.$sort }}/{{ eps.length }}</span>
                <NIcon size="12px" class="ml-1">
                  <ArrowForwardIosOutlined />
                </NIcon>
              </span>
            </div>
            <Popup round position="bottom" class="h-[70vh] flex flex-col" v-if="nowPage"
              v-model:show="isShowEpSelectPopup">
              <div class="w-full h-10 pt-2 pl-8 flex items-center font-bold text-lg">选集</div>
              <List class="w-full h-full" :source="{ data: nowPage.eps.content, isEnd: true }" :itemHeight="40"
                v-slot="{ data: { item: ep }, height }" :data-processor="v => v.toReversed()" ref="epSelList">
                <VanCell class="w-full flex items-center van-hairline--top pl-5" clickable @click="epId = ep.$id"
                  :title-class="[epId == ep.$id && 'font-bold !text-(--nui-primary-color)']"
                  :style="{ height: `${height}px !important` }" :title="ep.name || `第${ep.$sort}话`">
                </VanCell>
              </List>
            </Popup>
          </div>
          <!-- recommend -->
          <div class="van-hairline--top w-full *:bg-transparent" v-if="nowPage.recommendComics.content.data.value">
            <ComicCard v-for="comic of nowPage.recommendComics.content.data.value" :comic :height="140" />
          </div>
        </Content>
      </VanTab>

      <VanTab class="min-h-full van-hairline--top" title="评论" name="comment">
        <template #title>
          <span>评论</span>
          <span class="!text-xs ml-0.5 font-light">{{ detail?.$comment_total ?? '' }}</span>
        </template>
        <!-- <CommentView :id="comicId" class="h-[calc(70vh-var(--van-tabs-line-height))] w-full" /> -->
      </VanTab>
    </VanTabs>
  </NScrollbar>
</template>