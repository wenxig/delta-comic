import { isError } from "es-toolkit"
import { isNumber, toString } from "es-toolkit/compat"
import { motion } from "motion-v"
import { NProgress } from "naive-ui"
import { nextTick, TransitionGroup } from "vue"
import { reactive, ref, watch, type Reactive } from "vue"

export interface DownloadMessageProgress extends DownloadMessageLoading {
  /** 0~1 */  progress: number
}
export interface DownloadMessageLoading {
  description: string
  retryable: boolean
}
export interface DownloadMessageBind {
  createProgress<TResult>(title: string, fn: (ins: Reactive<DownloadMessageProgress>) => PromiseLike<TResult>): Promise<TResult>
  createLoading<TResult>(title: string, fn: (ins: Reactive<DownloadMessageLoading>) => PromiseLike<TResult>): Promise<TResult>
}
const allDownloadMessagesCount = ref(0)
export const createDownloadMessage = async <T,>(title: string, bind: (method: DownloadMessageBind) => PromiseLike<T>): Promise<T> => {
  allDownloadMessagesCount.value++
  const messageList = reactive(new Array<{
    title: string
    description: string
    retry?: () => any
    progress?: number
  } & ({
    state: 'success' | undefined
  } | {
    state: 'error'
    reason: string
  })>())
  const allDone = ref(false)
  const minsize = ref(false)
  const minsizeWatcher = watch(minsize, min => {
    if (min) allDownloadMessagesCount.value++
    else allDownloadMessagesCount.value--
  }, { immediate: true })
  const message = window.$message.create(title, {
    render: $props => (<motion.div drag="y"
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragTransition={{ bounceStiffness: 500, bounceDamping: 15 }}
      variants={{
        minsize: {
          borderRadius: '100%',
          width: '20px',
          height: '20px',
          padding: '2px',
          position: 'fixed',
          left: `${allDownloadMessagesCount.value * 40}px`,
          top: '4px'
        },
        maxsize: {
          borderRadius: '8px',
          width: '90vw',
          paddingInline: '8px',
          paddingBlock: '12px',
          boxShadow: 'var(--n-box-shadow)'
        }
      }}
      onDragEnd={() => minsize.value = true}
      animate={minsize.value ? 'minsize' : 'maxsize'}
      class="transition-all bg-(--n-color) overflow-hidden"
    >
      {allDownloadMessagesCount.value}
      {
        minsize.value || <>
          <div class='font-semibold text-base'>
            {$props.content}
          </div>
          {/* content */}
          {/* @ts-ignore class应当存在 */}
          <TransitionGroup name="list" tag="ul" class="!w-full h-fit !ml-1">
            {
              messageList.map((v, index) => (
                <div class="w=full py-1 van-hairline--bottom" key={index} >
                  <span class="font-semibold text-sm">{v.title}</span>
                  {
                    <NProgress
                      percentage={isNumber(v.progress) ? v.progress : 100}
                      indicatorPlacement="inside"
                      processing
                      type="line"
                      showIndicator={false}
                      show-indicator={false}
                      class="**:in-[.n-progress-graph-line-fill]:!hidden !w-[80%]"
                      height={isNumber(v.progress) ? 10 : 7}
                      status={v.state}
                    />
                  }
                  <div class="text-xs text-(--van-text-color-2) !h-[1rem]">{v.description || '...'}</div>
                </div>
              ))
            }
          </TransitionGroup>
        </>
      }
    </motion.div>),
    duration: 0,
  })
  const createLine = <T extends object, TResult extends PromiseLike<any>,>(title: string, config: T, fn: (config: Reactive<{ description: string, retryable: boolean } & T>) => TResult) => {
    const pc = Promise.withResolvers<Awaited<TResult>>()
    const state = ref<(typeof messageList)[number]['state']>()
    const _config = reactive({
      description: '',
      retryable: false,
      ...config
    })
    let errorReason = ''
    const index = messageList.length
    const watcher = watch([_config, state], ([, state]) => {
      messageList[index] = {
        title,
        state,
        reason: errorReason,
        retry: _config.retryable ? call : undefined,
        ..._config
      }
    }, { immediate: true })
    const call = async () => {
      state.value = undefined
      _config.description = ''
      _config.retryable = false
      for (const key in config) {
        if (!Object.hasOwn(config, key)) continue
        const element = config[key]
        _config[key as keyof typeof _config] = element as any
      }
      try {
        const v = await fn(_config)
        state.value = 'success'
        await nextTick()
        watcher.stop()
        pc.resolve(v)
      } catch (err) {
        if (isError(err)) {
          errorReason = err.name
        } else {
          errorReason = toString(err)
        }
        state.value = 'error'
        await nextTick()
        if (!_config.retryable) {
          watcher.stop()
          pc.reject(err)
        }
      }
    }
    call()
    return pc.promise
  }

  const createProgress: DownloadMessageBind['createProgress'] = (title, fn) => {
    return createLine(title, { progress: 0 }, fn)
  }
  const createLoading: DownloadMessageBind['createLoading'] = (title, fn) => {
    return createLine(title, {}, fn)
  }
  const result = await bind({
    createProgress,
    createLoading
  })
  message.destroy()
  minsizeWatcher.stop()
  return result
}

// createDownloadMessage('下载中', async m => {
//   m.createLoading('加载', async c => {
//     await delay(5000)
//     c.description = '结束'
//   })
//   await m.createProgress('加载', async c => {
//     const pc = Promise.withResolvers()
//     c.description = '123'
//     const inv = setInterval(() => {
//       if (c.progress >= 100) {
//         pc.resolve()
//         clearInterval(inv)
//         console.log('success')
//         return
//       }
//       c.progress += 10
//     }, 1000)
//     return pc.promise
//   })
//   await m.createLoading('加载', async c => {
//     await delay(5000)
//     c.description = '结束'
//   })
// })