<script setup lang="ts">
import { uni, Utils } from 'delta-comic-core'
import { recentViewDb } from './db/recentView'
import { onMounted, toRaw } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { App } from '@capacitor/app'
import { Clipboard } from '@capacitor/clipboard'
import { Mutex } from 'es-toolkit'
import { useIntervalFn } from '@vueuse/core'
import { Capacitor } from '@capacitor/core'

const $router = useRouter()
const $route = useRoute()

Utils.eventBus.SharedFunction.define(item => recentViewDb.$push({
  item: toRaw(item),
  ep: toRaw(item.thisEp)
}), 'core', 'addRecent')
await $router.push($route.fullPath)

const scanned = new Set<string>()
Utils.eventBus.SharedFunction.define(async token => {
  await Clipboard.write({
    string: token
  })
  scanned.add(token)
  window.$message.success('复制成功')
}, 'core', 'pushShareToken')

const handleShareTokenCheck = async () => {
  if (!Capacitor.isNativePlatform()) if (!document.hasFocus()) return
  const chipText = (await Clipboard.read()).value
  if (scanned.has(chipText)) return
  scanned.add(chipText)

  const handlers = Array.from(uni.content.ContentPage.shareToken.values()).filter(v => v.patten(chipText))
  console.log('new chipText discovery', chipText, handlers)
  const lock = new Mutex
  for (const handler of handlers) {
    await lock.acquire()
    const detail = await handler.show(chipText)
    window.$dialog.info({
      title: `口令探测：${detail.title}`,
      content: detail.detail,
      closeOnEsc: false,
      maskClosable: false,
      closable: false,
      positiveText: '查看',
      negativeText: '取消',
      onPositiveClick() {
        detail.onPositive()
        lock.release()
      },
      onNegativeClick() {
        detail.onNegative()
        lock.release()
      },
    })
  }
}

App.addListener('resume', handleShareTokenCheck)
onMounted(handleShareTokenCheck)
useIntervalFn(handleShareTokenCheck, 2000)
</script>

<template>
  <RouterView :key="$route.meta.force ? $route.fullPath : undefined" v-slot="{ Component }">
    <component :is="Component" />
  </RouterView>
</template>