<script setup lang='ts'>

import { usePluginStore } from '@/plugin/store'
import { toReactive, useFileDialog } from '@vueuse/core'
import { Utils } from 'delta-comic-core'
import { isEmpty } from 'es-toolkit/compat'
import { useMessage } from 'naive-ui'
import { computed, ref } from 'vue'
const pluginStore = usePluginStore()
const inputUrl = ref('')
const r = /^[a-zA-Z]+:\/\/[^\s]+.(js|mjs|cjs|ts|mts)$/
const r2 = /^[\w\d-]+\/[\w\d-]+$/
const isValid = computed(() => r.test(inputUrl.value) || r2.test(inputUrl.value) || (URL.canParse(inputUrl.value) && inputUrl.value.includes('localhost')))
const isAdding = ref(false)
const $message = useMessage()
const confirmAdd = async (url: string) => {
  if (isAdding.value) {
    $message.warning('正在添加插件')
    return
  }
  isAdding.value = true
  if (!r.test(url) && !r2.test(url) && !(URL.canParse(url) && url.includes('localhost'))) {
    $message.error('输入值不合法')
    isAdding.value = false
    return
  }
  try {
    await Utils.message.createDialog({
      type: 'info',
      title: '确认添加插件？',
      content: `添加来自"${url}"的插件`,
      onPositiveClick: () => {
        return
      },
      onNegativeClick: () => {
        isAdding.value = false
      },
    })
  } catch (error) {
    console.error(error)
  }
  await Utils.message.createDownloadMessage('下载插件', async m => {
    if (r2.test(url)) {
      const [owner, repo] = url.split('/')
      await pluginStore.$addPluginFromGithub(owner, repo, m)
    }
    else await pluginStore.$addPluginFromNet(url, m)
    isAdding.value = false
  })
}
const upload = toReactive(useFileDialog({
  accept: '.js, .mjs, .cjs',
  multiple: false
}))
const useUploadPlugin = () => {
  if (isAdding.value) {
    $message.warning('正在添加插件')
    return
  }
  isAdding.value = true
  upload.reset()
  upload.open()
  const { off: stop } = upload.onChange(async (files) => {
    stop()
    cel.off()
    await Utils.message.createDownloadMessage('安装插件', async m => {
      try {
        const file = files?.item(0)
        if (!file) {
          isAdding.value = false
          throw new Error('未上传文件')
        }
        const userscript = await m.createLoading('解析文件中', () => file.text())
        await pluginStore.$addPlugin(userscript, m)
        upload.reset()
      } catch (error) {
        throw error
      }
      isAdding.value = false
    })
  })
  const cel = upload.onCancel(() => {
    upload.reset()
    stop()
    cel.off()
    isAdding.value = false
  })
}
</script>

<template>
  <div class="w-full">
    <div class="pt-3 pl-5 text-2xl mb-2">插件安装</div>
    <NInput v-model:value="inputUrl" class="w-[calc(100%-10px)]! m-1.25" :status="isValid ? 'success' : 'error'"
      clearable placeholder="输入插件的链接" :disabled="isAdding" :loading="isAdding" />
    <div class="p-10 flex w-full items-center justify-center gap-4">
      <NButton type="primary" size="large" class="w-1/2!" :loading="isAdding" :disabled="!isValid || isAdding"
        @click="confirmAdd(inputUrl)">确认
      </NButton>
      <NButton type="primary" secondary size="large" class="" :loading="isAdding" :disabled="isAdding"
        @click="useUploadPlugin">使用本地文件
      </NButton>
    </div>
    <NEmpty class="text-center mb-2" v-if="isEmpty(pluginStore.savedPluginCode)">
      你还没有安装任何插件<br>
      无法启动应用
    </NEmpty>
    <ul class="ml-10 w-fit *:my-1">
      <li class="w-fit flex items-center gap-3">
        <span class="size-2 rounded-full item-center bg-(--van-text-color) shrink-0" aria-hidden="true"></span>
        <div>
          <div class="font-medium">输入以".js"为结尾的完整链接</div>
        </div>
      </li>
      <li class="w-fit flex items-center gap-3">
        <span class="size-2 rounded-full item-center bg-(--van-text-color) shrink-0" aria-hidden="true"></span>
        <div>
          <div class="font-medium">输入github仓库
            <br>(如: wenxig/delta-comic-plugin-jmcomic )
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>