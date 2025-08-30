<script setup lang='ts'>
import { JmContentPage, useContentStore } from '@/stores/content'
import { DrawOutlined, ReportGmailerrorredRound, ShareSharp, StarFilled } from '@vicons/material'
import { computed, onUnmounted, useTemplateRef } from 'vue'
import { DislikeFilled, LikeFilled } from '@vicons/antd'
import { createDateString } from '@/utils/translator'
import { useRoute, useRouter } from 'vue-router'
import { jm } from '@/api/jm'
import BaseInfo from './baseInfo.vue'
import { uni } from '@/api/union'
import { useMessage } from 'naive-ui'
import { useHistoryStore } from '@/db/history'
const $route = useRoute()
const contentStore = useContentStore()
const comicId = Number($route.params.id.toString())
const nowPage = computed(() => <JmContentPage | undefined>contentStore.now)
const detail = computed(() => nowPage.value?.detail.content.data.value)
const preload = computed(() => nowPage.value?.preload.value)
const $message = useMessage()
const shareComic = () => {
  if (!preload.value) return
  navigator.share({
    url: location.href,
    text: `${preload.value.name}(JM${comicId})`,
    title: 'DeltaComic的漫画分享'
  })
}

const historyStore = useHistoryStore()
const historyPage = historyStore.$get([comicId.toString(), 'jm', 'comic'])
if (historyPage) {
  $message.info('已定位至上次观看')
}
const handleHistorySave = (page: number) => {
  if (!preload.value) return
  historyStore.$update(preload.value.toUniComic(), page)
}
handleHistorySave(0)

const infoComp = useTemplateRef('infoComp')
const $router = useRouter()
onUnmounted($router.beforeResolve(() => {
  if (infoComp.value?.view) handleHistorySave(infoComp.value.view.index)
  return true
}))
</script>

<template>
  <BaseInfo :startEp="historyPage?.watchEp ?? comicId" :defaultPage="historyPage?.watchProgress ?? 0"
    :tags="detail?.tags.concat(detail.works).concat(detail.actors) ?? []" id-prefix="JM"
    :get-eps="async (id, signal) => (await jm.api.comic.getComicPages(id, signal)).map(v => new uni.image.Image(v))"
    :categories="preload?.toUniComic().categories ?? []" ref="infoComp" @change-page="handleHistorySave">
    <template #userInfo>
      <div class="-mt-0.5 van-ellipsis max-w-2/3 text-(--nui-primary-color) text-[16px] flex items-center pl-2">
        <span v-for="author of preload?.$author" class="mr-0.5 flex items-center">
          <NIcon class="mr-0.5 not-first:ml-1" size="25px">
            <DrawOutlined />
          </NIcon>
          <span>{{ author }}</span>
        </span>
      </div>
    </template>
    <template #id>
      <div class="text-(--van-text-color-2) text-xs flex gap-1 items-center ">
        <span>
          <VanIcon class="mr-0.5 " name="eye-o" size="14px" />
          <span>{{ detail?.$total_views }}</span>
        </span>
        <span>
          <span>{{ createDateString(detail?.$addtime) }}</span>
        </span>
      </div>
    </template>
    <template #action>
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
    </template>
    <template #commentView>
      <JmCommentView :id="comicId" class="h-[calc(70vh-var(--van-tabs-line-height))] w-full" />
    </template>
  </BaseInfo>
</template>