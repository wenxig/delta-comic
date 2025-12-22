<script setup lang='ts'>
import { LikeFilled } from '@vicons/antd'
import { ArrowBackRound, ArrowForwardIosOutlined, FolderOutlined, FullscreenRound, KeyboardArrowDownRound, PlayArrowRound, PlusRound, ReportGmailerrorredRound } from '@vicons/material'
import { computedAsync, createReusableTemplate, useCssVar } from '@vueuse/core'
import { uni, Comp, Utils, requireDepend, coreModule, Store } from 'delta-comic-core'
import { motion } from 'motion-v'
import { computed, shallowRef, useTemplateRef, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import FavouriteSelect from '@/components/favouriteSelect.vue'
import { sortBy } from 'es-toolkit/compat'
import Comment from '@/components/comment/index.vue'
import { PopoverAction } from 'vant'
import { useAppStore } from '@/stores/app'
import { useLiveQueryRef } from '@/utils/db'
import { subscribeDb, subscribeKey } from '@/db/subscribe'
import { isString } from 'es-toolkit'
import DOMPurify from 'dompurify'
import AuthorIcon from '@/components/user/authorIcon.vue'

const $router = window.$router
const $route = useRoute()
const $props = defineProps<{
  page: uni.content.ContentPage
  isR18g?: boolean
}>()
const union = computed(() => $props.page.union.value!)
const showTitleFull = shallowRef(false)
const [TitleTemp, TitleComp] = createReusableTemplate()
const isScrolled = shallowRef(false)

const scrollbar = useTemplateRef('scrollbar')
const epSelList = useTemplateRef('epSelList')
const isShowEpSelectPopup = shallowRef(false)
const eps = computedAsync(async () => sortBy(await $props.page.eps.content, v => Number(v.index)), [])
const nowEpId = $route.params.ep.toString()
const nowEp = computed(() => eps.value.find(ep => ep.index === nowEpId))
const nowEpIndex = computed(() => eps.value.findIndex(ep => ep.index === nowEpId))
const openEpSelectPopup = async () => {
  scrollbar.value?.scrollTo(0, 0)
  isShowEpSelectPopup.value = true
  await nextTick()
  epSelList.value?.listInstance?.scrollTo({
    index: eps.value.findIndex(ep => ep.index === nowEpId)
  })
}

const safeHeightTopCss = useCssVar('--safe-area-inset-top')
const safeHeightTop = computed(() => Number(safeHeightTopCss.value?.match(/\d+/)?.[0]))

const slots = defineSlots<{
  view(): void
}>()
const { comp } = requireDepend(coreModule)
const getItemCard = (contentType: uni.content.ContentType_) => uni.item.Item.itemCard.get(contentType) ?? comp.ItemCard

const handleChick = (preload: uni.item.RawItem) =>
  Utils.eventBus.SharedFunction.call('routeToContent', preload.contentType, preload.id, preload.thisEp.index, <any>preload)
const isLiked = shallowRef(union.value?.isLiked ?? false)
const likeSignal = new Utils.request.SmartAbortController()
const handleLike = async () => {
  likeSignal.abort()
  try {
    union.value.like(likeSignal.signal)
      .then(v => isLiked.value = v)
  } catch (error) {
    console.error('liked fail')
  }
}

const appStore = useAppStore()

const contentSource = Utils.data.PromiseContent.withResolvers<uni.item.Item>(true)
watch($props.page.union, union => {
  if (!union) return
  console.log('resolve', union)
  contentSource.resolve(union)
}, { immediate: true })

$props.page.detail.content.onError(err => {
  console.error('resolve catch', err)
  contentSource.reset(false)
  contentSource.reject(err)
})
$props.page.detail.content.onSuccess(data => {
  console.log('resolve then', $props.page.preload.value)
  contentSource.reset(false)
  contentSource.resolve(data)
})

const config = Store.useConfig()

const [DefineAvatar, Avatar] = createReusableTemplate<{
  author: uni.item.Author
}>()

const getActionInfo = (key: string) => uni.user.User.authorActions.get([union.value.$$plugin, key])!

const allOfSubscribe = useLiveQueryRef(() => subscribeDb.all.toArray(), [])
const getSubscribe = (author: uni.item.Author) => allOfSubscribe.value.find(v => v.key == subscribeKey.toString([union.value.$$plugin, author.label]))
const getIsSubscribe = (author: uni.item.Author) => !!getSubscribe(author)

const showDetailUsers = shallowRef(false)
</script>

<template>
  <NScrollbar ref="scrollbar" class="*:w-full h-full! bg-(--van-background-2)"
    :style="{ '--van-background-2': isR18g ? 'color-mix(in oklab, var(--nui-error-color-hover) 5%, transparent)' : 'var(--nui-body-color)' }">
    <div class="bg-black text-white h-[30vh] relative flex justify-center">
      <div class="absolute z-3 pointer-events-none *:pointer-events-auto top-0 w-full flex h-14 items-center pt-safe">
        <VanSticky>
          <div class="h-[calc(56px+var(--safe-area-inset-top))] pt-safe transition-colors flex items-center w-screen"
            :class="[isScrolled ? ' bg-(--p-color)' : 'bg-transparent']">
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
      <Teleport to="#cover" :disabled="!appStore.isFullScreen">
        <slot name="view" />
      </Teleport>
      <VanRow class="absolute bottom-0 w-full z-2 pointer-events-none">
        <VanCol span="1" offset="21">
          <NButton class="text-3xl! pointer-events-auto" @click="appStore.isFullScreen = true" text color="#fff">
            <NIcon>
              <FullscreenRound />
            </NIcon>
          </NButton>
        </VanCol>
      </VanRow>
    </div>
    <VanTabs shrink swipeable sticky :offset-top="56 + safeHeightTop" background="var(--nui-card-color)"
      @scroll="({ isFixed }) => isScrolled = isFixed" class="min-h-[70vh]! tab">
      <VanTab class="min-h-full relative van-hairline--top bg-(--nui-body-color)" title="简介" name="info">
        <Comp.Content :source="contentSource.content" retriable @reset-retry="$props.page.reloadAll"
          class="min-h-[60vh]">
          <div class="flex relative text-nowrap mt-3 items-center pb-2" v-if="(union?.author.length ?? 0) > 1"
            @click="showDetailUsers = true">
            <span class="ml-3 font-bold">创作团队</span>
            <span class="absolute right-3 text-(--van-text-color-2)">共{{ union?.author.length }}位</span>
            <Comp.Popup v-model:show="showDetailUsers" position="bottom" round class="h-[50vh]">
              <div v-for="author of union.author" class="relative w-full py-2 van-hairline--bottom">
                <Avatar :author />
                <Comp.Var :value="getIsSubscribe(author)" v-slot="{ value: isSubscribe }">
                  <NButton round type="primary" class="absolute! right-3 top-1/2 -translate-y-1/2" size="small"
                    :color="isSubscribe ? '#6a7282' : undefined"
                    @click.stop="isSubscribe
                      ? Utils.message.createLoadingMessage('取消中').bind(subscribeDb.$remove(subscribeKey.toString([union.$$plugin, author.label])))
                      : Utils.message.createLoadingMessage('关注中').bind(subscribeDb.$add({ type: 'author', plugin: author.$$plugin, author: union.author[0], key: subscribeKey.toString([union.$$plugin, union.author[0].label]) }))">
                    <template #icon>
                      <NIcon :class="isSubscribe ? 'rotate-45' : 'rotate-0'" class="transition-transform">
                        <PlusRound />
                      </NIcon>
                    </template>
                    {{ isSubscribe ? '取关' : '关注' }}
                  </NButton>
                </Comp.Var>
              </div>
            </Comp.Popup>
          </div>
          <div class="flex items-center text-nowrap overflow-x-auto" @pointerdown.stop @click.stop @pointermove.stop>
            <DefineAvatar v-slot="{ author }">
              <VanPopover :actions="(author.actions ?? []).map(k => ({
                text: getActionInfo(k).name,
                icons: getActionInfo(k).icon,
                key: k
              }))" @select="q => getActionInfo(q.key).call(author)" placement="bottom-start">
                <template #reference>
                  <div class="van-ellipsis w-fit text-(--p-color) text-[16px] flex items-center pl-2">
                    <AuthorIcon :size-spacing="8.5" :author class="mx-2" />
                    <div class="flex flex-col w-full text-nowrap">
                      <div class="text-(--nui-primary-color) flex items-center">
                        {{ author.label }}
                      </div>
                      <div class="-mt-0.5 max-w-2/3 text-(--van-text-color-2) text-[11px] flex items-center">
                        {{ author.description }}
                      </div>
                    </div>
                  </div>
                </template>
                <template #action="{ action: { text, icons } }: { action: PopoverAction, index: number }">
                  <div class="flex items-center justify-center w-full text-nowrap relative gap-1">
                    <NIcon color="var(--van-text-color)" class="flex! items-center!" size="18px">
                      <component :is="icons" />
                    </NIcon>
                    <div>{{ text }}</div>
                  </div>
                </template>
              </VanPopover>
            </DefineAvatar>
            <div v-if="union?.author.length === 1" class="mt-3 relative w-full">
              <Avatar :author="union.author[0]" />
              <Comp.Var :value="getIsSubscribe(union.author[0])" v-slot="{ value: isSubscribe }">
                <NButton round type="primary" class="absolute! right-3 top-1/2 -translate-y-1/2" size="small"
                  :color="isSubscribe ? '#6a7282' : undefined"
                  @click.stop="isSubscribe
                    ? Utils.message.createLoadingMessage('取消中').bind(subscribeDb.$remove(subscribeKey.toString([union.$$plugin, union.author[0].label])))
                    : Utils.message.createLoadingMessage('关注中').bind(subscribeDb.$add({ type: 'author', plugin: union.author[0].$$plugin, author: union.author[0], key: subscribeKey.toString([union.$$plugin, union.author[0].label]) }))">
                  <template #icon>
                    <NIcon :class="isSubscribe ? 'rotate-45' : 'rotate-0'" class="transition-transform">
                      <PlusRound />
                    </NIcon>
                  </template>
                  {{ isSubscribe ? '取关' : '关注' }}
                </NButton>
              </Comp.Var>
            </div>
            <div v-else class="flex overflow-x-scroll overflow-y-hidden scroll" @click.stop>
              <div class="flex w-full text-nowrap gap-3 items-center" v-for="author of union?.author">
                <Avatar :author />
                <NButton round type="primary" class="px-0! aspect-square" size="small" v-if="!getIsSubscribe(author)"
                  @click.stop="getIsSubscribe(author)
                    ? Utils.message.createLoadingMessage('取消中').bind(subscribeDb.$remove(subscribeKey.toString([union.$$plugin, author.label])))
                    : Utils.message.createLoadingMessage('关注中').bind(subscribeDb.$add({ type: 'author', author, key: subscribeKey.toString([union.$$plugin, author.label]), plugin: union.$$plugin }))">
                  <template #icon>
                    <NIcon>
                      <PlusRound />
                    </NIcon>
                  </template>
                </NButton>
              </div>
            </div>
          </div>
          <div class="w-[95%] mx-auto mt-2">
            <div class="flex relative h-fit">
              <div class="text-[17px] font-medium w-[89%] relative">
                <TitleTemp>
                  <div class="text-xs mt-1 font-normal flex text-(--van-text-color-2) *:flex *:items-center gap-1">
                    <div class="text-(--van-text-color-2) text-xs flex gap-1 items-center ">
                      <span>
                        <VanIcon class="mr-0.5 " name="eye-o" size="14px" />
                        <span>{{ union?.viewNumber }}</span>
                      </span>
                      <span>
                        <span>{{ Utils.translate.createDateString(union?.$updateTime) }}</span>
                      </span>
                    </div>
                  </div>
                </TitleTemp>
                <AnimatePresence>
                  <motion.div :initial="{ opacity: 0 }" :exit="{ opacity: 0 }" key="info" :animate="{ opacity: 1 }"
                    v-if="!showTitleFull" class="flex flex-col absolute top-0 van-ellipsis w-full">
                    <span @click="showTitleFull = !showTitleFull">
                      {{ union?.title }}
                    </span>
                    <TitleComp />
                  </motion.div>
                </AnimatePresence>
                <NCollapseTransition :show="showTitleFull" class="w-[calc(100%+2rem)]!">
                  <span @click="showTitleFull = !showTitleFull" class="w-[calc(100%-2rem)]">
                    {{ union?.title }}
                  </span>
                  <TitleComp />
                  <div class="flex  font-light text-(--van-text-color-2) justify-start text-xs mt-0.5">
                    <div class="mr-2">
                      {{ page.plugin }}{{ page.pid.content.data.value }}
                    </div>
                  </div>
                  <Comp.Text :text="union.description" v-if="isString(union?.description)"
                    class="font-normal  mt-1 text-(--van-text-color-2) justify-start text-xs">
                  </Comp.Text>
                  <Comp.Text :text="union.description.content" v-else-if="union?.description?.type == 'text'"
                    class="font-normal  mt-1 text-(--van-text-color-2) justify-start text-xs">
                  </Comp.Text>
                  <div v-html="DOMPurify.sanitize(union?.description?.content ?? '')" v-else
                    class="font-normal  mt-1 text-(--van-text-color-2) justify-start text-xs max-w-full">
                  </div>
                  <div class="flex flex-col w-full"
                    v-for="[name, categories] of Object.entries(Object.groupBy(union?.categories ?? [], v => v.group))">
                    <NDivider class="text-xs! my-1! text-(--van-gray-7)! **:font-light!" title-placement="left">
                      {{ name }}
                    </NDivider>
                    <div class="flex flex-wrap gap-2.5 *:px-3! **:text-xs!">
                      <NButton tertiary round type="tertiary" size="small"
                        v-for="category of categories?.toSorted((a, b) => b.name.length - a.name.length).filter(Boolean)"
                        @click="Utils.eventBus.SharedFunction.call('routeToSearch', category.search.keyword, [page.plugin, category.search.source], category.search.sort)">
                        {{ category.name }}
                      </NButton>
                    </div>
                  </div>
                </NCollapseTransition>
              </div>
              <NIcon size="2rem" color="var(--van-text-color-3)" class="absolute -top-0.5 -right-1 transition-transform"
                :class="[showTitleFull && 'rotate-180!']" @click="showTitleFull = !showTitleFull">
                <KeyboardArrowDownRound />
              </NIcon>
            </div>
            <!-- action bar -->
            <div class="mt-8 mb-4 flex justify-around" v-if="union">
              <Comp.ToggleIcon padding size="27px" v-model="isLiked" @click="handleLike" :icon="LikeFilled">
                {{ ((union.likeNumber ?? 0) + (isLiked ? 1 : 0)) || '喜欢' }}
              </Comp.ToggleIcon>
              <Comp.ToggleIcon padding size="27px" :icon="FolderOutlined" dis-changed>
                缓存
              </Comp.ToggleIcon>
              <Comp.ToggleIcon padding size="27px" dis-changed :icon="ReportGmailerrorredRound">
                举报
              </Comp.ToggleIcon>
              <FavouriteSelect :item="union" />
              <ShareButton :page />
            </div>
            <!-- ep select -->
            <div class="relative mb-4 w-full flex items-center rounded pl-3 py-2 van-haptics-feedback"
              :class="[isR18g ? (config.isDark ? '' : 'bg-(--van-gray-1)/70') : (config.isDark ? 'bg-(--van-gray-8)' : 'bg-(--van-gray-2)')]"
              v-if="eps && eps.length > 1" @click="openEpSelectPopup">
              <span>选集</span>
              <span class="mx-0.5">·</span>
              <span class="max-w-1/2 van-ellipsis">{{ nowEp?.name || `第${nowEpIndex + 1}话` }}</span>
              <span class="absolute right-2 text-xs text-(--van-text-color-2) flex items-center">
                <span>{{ nowEpIndex + 1 }}/{{ eps.length }}</span>
                <NIcon size="12px" class="ml-1">
                  <ArrowForwardIosOutlined />
                </NIcon>
              </span>
            </div>
            <Comp.Popup round position="bottom" class="h-[70vh] flex flex-col" v-model:show="isShowEpSelectPopup">
              <div class="w-full h-10 pt-2 pl-8 flex items-center font-bold text-lg">选集</div>
              <Comp.List class="w-full h-full" :source="{ data: Utils.data.PromiseContent.resolve(eps), isEnd: true }"
                :itemHeight="40" v-slot="{ data: { item: ep, index }, height }" ref="epSelList">
                <VanCell clickable @click="handleChick({ ...union.toJSON(), thisEp: ep.toJSON() })"
                  :title="ep.name || `第${index + 1}话`"
                  :title-class="[nowEpId === ep.index && 'font-bold text-(--p-color)!']"
                  class="w-full flex items-center " :style="{ height: `${height}px !important` }">
                </VanCell>
              </Comp.List>
            </Comp.Popup>
          </div>
          <!-- recommend -->
          <div class="van-hairline--top w-full *:bg-transparent" v-if="page.recommends.content.data.value">
            <component :is="getItemCard(item.contentType)" :item v-for="item of page.recommends.content.data.value" />
          </div>
        </Comp.Content>
      </VanTab>

      <VanTab class="h-full! van-hairline--top" title="评论" name="comment">
        <template #title>
          <span>评论</span>
          <span class="text-xs! ml-0.5 font-light">{{ union?.commentNumber ?? '' }}</span>
        </template>
        <Comment :comments="page.comments" :item="union" class="h-[calc(70vh-38px)]" />
      </VanTab>
    </VanTabs>
  </NScrollbar>
</template>
<style scoped lang='css'>
.scroll::-webkit-scrollbar {
  display: none;
}

:deep(.van-tabs__wrap) {
  --van-tabs-line-height: 38px;
  height: var(--van-tabs-line-height) !important;
}
</style>
<style>
:root {
  --van-tabs-line-height: 38px !important;
}
</style>