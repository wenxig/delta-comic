import { Cell } from "vant"
import { TransitionGroup } from "vue"
import { nextTick, reactive, ref, watch, type Reactive } from "vue"

export interface DownloadMessageProgress extends DownloadMessageLoading {
  /** 0~1 */  progress: number
}
export interface DownloadMessageLoading {
  description: string
  retryable: boolean
  success(): void
  error(reason: string): void
}
export interface DownloadMessageBind {
  createProgress<TResult>(title: string, fn: (ins: Reactive<DownloadMessageProgress>) => PromiseLike<TResult>): Promise<TResult>
  createLoading<TResult>(title: string, fn: (ins: Reactive<DownloadMessageLoading>) => PromiseLike<TResult>): Promise<TResult>
}
export const createDownloadMessage = async <T,>(title: string, bind: (method: DownloadMessageBind) => PromiseLike<T>): Promise<T> => {
  const messageList = reactive(new Array<{
    title: string
    description: string
    retry?: () => any
    progress?: number
  } & ({
    state: 'success' | 'progress'
  } | {
    state: 'error'
    reason: string
  })>())
  const message = window.$message.create(title, {
    render: $props => (<div class="w-[80vw] bg-(--nui-popover-color) px-2 py-3 rounded-lg">
      <div class='font-semibold text-base'>
        {$props.content}
      </div>
      {/* content */}
      {/* @ts-ignore class应当存在 */}
      <TransitionGroup name="list" tag="ul" class="!w-full h-fit">
        {
          messageList.map(v => (
            <div class="w=full py-1" >
              <span class="font-semibold">{v.title}</span>
            </div>
          ))
        }
      </TransitionGroup>
    </div>),
    duration: 0,

  })
  const createProgress: DownloadMessageBind['createProgress'] = (title, fn) => {
    const pc = Promise.withResolvers<Awaited<ReturnType<typeof fn>>>()
    const state = ref<(typeof messageList)[number]['state']>('progress')
    let errorReason = ''
    const config = reactive<DownloadMessageProgress>({
      description: '',
      progress: 0,
      retryable: false,
      error(reason) {
        errorReason = reason
        state.value = 'error'
        nextTick().then(() => {
          watcher.stop()
        })
      },
      success() {
        state.value = 'success'
        nextTick().then(() => {
          watcher.stop()
        })
      },
    })
    const index = messageList.length
    const watcher = watch([config, state], ([config, state]) => {
      messageList[index] = {
        title,
        description: config.description,
        state,
        reason: errorReason,
        retry: config.retryable ? call : undefined,
        progress: config.progress
      }
    }, { immediate: true })
    const call = async () => {
      config.description = ''
      config.progress = 0
      config.retryable = false
      try {
        const v: any = await fn(config)
        config.success()
        pc.resolve(v)
      } catch (err) {
        config.error(errorReason)
        if (!config.retryable)
          pc.reject(err)
      }
    }
    return pc.promise
  }
  const createLoading: DownloadMessageBind['createLoading'] = (title, fn) => {
    const pc = Promise.withResolvers<Awaited<ReturnType<typeof fn>>>()
    const state = ref<(typeof messageList)[number]['state']>('progress')
    let errorReason = ''
    const config = reactive<DownloadMessageLoading>({
      description: '',
      retryable: false,
      error(reason) {
        errorReason = reason
        state.value = 'error'
        nextTick().then(() => {
          watcher.stop()
        })
      },
      success() {
        state.value = 'success'
        nextTick().then(() => {
          watcher.stop()
        })
      },
    })
    const index = messageList.length
    const watcher = watch([config, state], ([config, state]) => {
      messageList[index] = {
        title,
        description: config.description,
        state,
        reason: errorReason,
        retry: config.retryable ? call : undefined,
      }
    }, { immediate: true })
    const call = async () => {
      config.description = ''
      config.retryable = false
      try {
        const v: any = await fn(config)
        config.success()
        pc.resolve(v)
      } catch (err) {
        config.error(errorReason)
        if (!config.retryable)
          pc.reject(err)
      }
    }
    return pc.promise
  }
  const result = await bind({
    createProgress,
    createLoading
  })
  message.destroy()
  return result
}