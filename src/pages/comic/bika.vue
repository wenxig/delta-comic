<script setup lang='ts'>
import { BikaComicPage, useComicStore } from '@/stores/comic'
import { DrawOutlined, DriveFolderUploadOutlined, GTranslateOutlined, NotInterestedRound, ReportGmailerrorredRound, ShareSharp, StarFilled } from '@vicons/material'
import { computed, onMounted, watch } from 'vue'
import { until } from '@vueuse/core'
import { DislikeFilled, LikeFilled } from '@vicons/antd'
import { useDialog, useMessage } from 'naive-ui'
import { createDateString } from '@/utils/translator'
import { useRoute, useRouter } from 'vue-router'
import { bika } from '@/api/bika'
import symbol from '@/symbol'
import BaseInfo from './baseInfo.vue'
import { uni } from '@/api/union'
const $route = useRoute()
const $router = useRouter()
const _id = $route.params.id.toString()
const nowPage = computed(() => <BikaComicPage | undefined>comic.now)
const comic = useComicStore()
const detail = computed(() => nowPage.value?.detail.content.data.value)
const preload = computed(() => nowPage.value?.preload.value)
const pid = computed(() => nowPage.value?.pid.content.data.value)
const $message = useMessage()
const $dialog = useDialog()
const shareComic = () => {
  if (!pid.value || !preload.value) return
  navigator.share({
    url: location.href,
    text: `${preload.value.title}(PICA${pid.value})`,
    title: 'DeltaComic的漫画分享'
  })
}
onMounted(async () => {
  await until(() => nowPage.value).toBeTruthy()
  if (!nowPage.value) throw 'error'
  watch(nowPage.value.veiled, veiled => {
    if (!veiled) $dialog.error({
      title: '错误',
      content: "漫画待审核",
      positiveText: '返回',
      onPositiveClick() {
        $router.back()
      },

    })
  })
})
const isR18g = computed(() => detail.value?.description.includes(symbol.bikaR18gNotice) || preload.value?.categories.includes('重口地帶') || false)

</script>

<template>
  <BaseInfo :categories="detail?.categories ?? []" :tags="detail?.tags ?? []" :isR18g id-prefix="PICA"
    :get-eps="async (epId, signal) => (await bika.api.comic.getComicPages(_id, Number(epId), signal)).map(v => new uni.image.Image(v.$media))"
    :avatar="detail?.$_creator.$avatar" :default-ep="1">
    <template #userInfo>
      <div class="text-(--nui-primary-color) flex items-center">
        <span class="flex items-center">
          <NIcon size="1rem" class="mr-0.5">
            <DriveFolderUploadOutlined />
          </NIcon>
          {{ detail?.$_creator.name }}
        </span>
      </div>
      <div class="-mt-0.5 van-ellipsis max-w-2/3 text-(--van-text-color-2) text-[11px] flex items-center">
        <span v-for="author of preload?.$author" class="mr-0.5">
          <NIcon class="mr-0.5 not-first:ml-1">
            <DrawOutlined />
          </NIcon>{{ author }}
        </span>
        <template v-if="detail?.chineseTeam">
          <NIcon class="ml-2 mr-0.5">
            <GTranslateOutlined />
          </NIcon>
          <span v-for="chineseTeam of detail?.$chineseTeam">
            {{ chineseTeam }}
          </span>
        </template>
      </div>
    </template>
    <template #searchPopup="{ previewUser }">
      <VanCell :title="detail?.$_creator.name" center is-link
        @click="detail?.$_creator && previewUser?.show(detail.$_creator)">
        <template #icon>
          <Image class=" size-8.5 mr-1" :src="detail?.$_creator.$avatar" round />
        </template>
      </VanCell>
      <template v-if="detail?.chineseTeam">
        <VanCell v-for="chineseTeam of detail?.$chineseTeam" center :title="chineseTeam" is-link
          @click="$router.force.push(`/search?keyword=${chineseTeam}&mode=translator`)">
          <template #icon>
            <NIcon size="30px" class="mr-1.5">
              <GTranslateOutlined />
            </NIcon>
          </template>
        </VanCell>
      </template>
    </template>
    <template #id>
      <span>
        <VanIcon class="mr-0.5 " name="eye-o" size="14px" />
        <span>{{ preload?.totalViews }}</span>
      </span>
      <span>
        <span>{{ createDateString(detail?.$created_at) }}</span>
      </span>
      <span v-if="!!(detail?.allowDownload ?? true)">
        <NIcon size="14px" class="mr-0.5 " color="var(--nui-error-color)">
          <NotInterestedRound />
        </NIcon>
        未经授权禁止下载
      </span>
    </template>
    <template #action>
      <ToggleIcon size="27px" @update:model-value="v => detail && (detail.isLiked = v)"
        :model-value="detail?.isLiked ?? false" @change="bika.api.comic.likeComic(_id)" :icon="LikeFilled">
        {{ detail?.likesCount ?? '喜欢' }}
      </ToggleIcon>
      <ToggleIcon size="27px" :icon="DislikeFilled" @click="$message.info('个性化功能设计中')" dis-changed>
        不喜欢
      </ToggleIcon>
      <ToggleIcon size="27px" dis-changed :icon="ReportGmailerrorredRound">
        举报
      </ToggleIcon>
      <ToggleIcon size="27px" @update:model-value="v => detail && (detail.isFavourite = v)"
        :model-value="detail?.isFavourite ?? false" @change="bika.api.comic.favouriteComic(_id)" :icon="StarFilled">
        收藏
      </ToggleIcon>
      <ToggleIcon size="27px" @click="shareComic()" :icon="ShareSharp" dis-changed>
        分享
      </ToggleIcon>
    </template>
    <template #commitView>
      <BikaCommentView :id="_id" :uploader="detail?.$_creator._id"
        class="h-[calc(70vh-var(--van-tabs-line-height))] w-full" v-if="detail?.allowComment ?? true" />
      <div v-else class="w-full h-[calc(70vh-var(--van-tabs-line-height))] text-center text-(--van-text-color-2)">
        评论区已关闭
      </div>
    </template>
  </BaseInfo>
</template>