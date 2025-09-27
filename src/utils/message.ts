import { computed, isRef, shallowRef, watch, type CSSProperties, type MaybeRefOrGetter } from "vue"
import { Utils } from "delta-comic-core"
import { isFunction } from "lodash-es"
import type { DialogOptions, DialogReactive } from "naive-ui"
import { noop } from "@vueuse/core"
import { router } from "@/router"

export type LoadingInstance = ReturnType<typeof createLoadingMessage>
export const createLoadingMessage = (text: MaybeRefOrGetter<string> = '加载中', api = window.$message) => {
  const data = computed(() => isRef(text) ? text.value : isFunction(text) ? text() : text)
  let loading = api.loading(data.value, {
    duration: 0,
  })
  const stop = watch(data, text => {
    loading.content = text
  })
  let isDestroy = false
  async function bind<T extends PromiseLike<any>>(promise?: T, throwError?: false, successText?: string, failText?: string): Promise<Awaited<T>>
  async function bind<T extends PromiseLike<any>>(promise?: T, throwError?: true, successText?: string, failText?: string): Promise<Awaited<T> | undefined>
  async function bind<T extends PromiseLike<any>>(promise?: T, throwError = true, successText?: string, failText?: string): Promise<Awaited<T> | undefined> {
    try {
      const res = await promise
      ctx.success(successText)
      return res
    } catch (error) {
      ctx.fail(failText)
      if (throwError)
        throw error
      return <any>undefined
    }
  }
  const ctx = {
    bind,
    async success(text = "成功！", delayTime = 500) {
      stop()
      if (isDestroy || !loading) return
      isDestroy = true
      loading.type = 'success'
      loading.content = text
      await Utils.delay.delay(delayTime)
      loading.destroy()
    },
    async fail(text = "失败！", delayTime = 500) {
      stop()
      if (isDestroy || !loading) return
      isDestroy = true
      loading.type = 'error'
      loading.content = text
      await Utils.delay.delay(delayTime)
      loading.destroy()
    },
    async info(text: string, delayTime = 500) {
      stop()
      if (isDestroy || !loading) return
      isDestroy = true
      loading.type = 'info'
      loading.content = text
      await Utils.delay.delay(delayTime)
      loading.destroy()
    },
    destroy() {
      stop()
      if (isDestroy || !loading) return
      isDestroy = true
      loading.destroy()
    },
    [Symbol.dispose]() {
      this.destroy()
    },
    instance: loading
  }
  return ctx
}

export const createDialog = (options: DialogOptions & { style?: CSSProperties }) => {
  let success = noop
  let fail = noop
  const result: PromiseWith<void, { ins: DialogReactive }> = new Promise<void>((s, f) => { success = s; fail = f })
  const show = shallowRef(true)
  const [zIndex, isLast, stopUse] = Utils.layout.useZIndex(show)
  const dialog = window.$dialog.create({
    positiveText: '确定',
    negativeText: '取消',
    ...options,
    style: {
      ...(options.style ?? {}),
      zIndex: zIndex.value
    },
    async onClose() {
      if ((await options.onClose?.()) === false) return false
      else show.value = false; failStop()
    },
    async onPositiveClick(e) {
      if ((await (options.onPositiveClick ?? noop)(e)) === false) return false
      else successStop()
    },
    async onNegativeClick(e) {
      const ret = await (options.onNegativeClick ?? noop)(e)
      if (ret) return ret
      else failStop()
    },
    onEsc() {
      options.onEsc?.()
      failStop()
    },
    onMaskClick(e) {
      options.onMaskClick?.(e)
      failStop()
    },
    onAfterLeave() {
      options.onAfterLeave?.()
      stop()
    }
  })
  const stopStyleWatch = watch(zIndex, zIndex => (<CSSProperties>dialog.style).zIndex = zIndex)
  const successStop = () => {
    success()
    stop()
  }
  const failStop = () => {
    fail()
    stop()
    return false
  }
  const stop = () => {
    stopStyleWatch()
    stopUse()
    stopRouterBreak()
    dialog.destroy()
    return show.value = false
  }
  const stopRouterBreak = router.beforeEach(() => {
    if (isLast) return failStop()
    return true
  })
  result.ins = dialog
  return result
}