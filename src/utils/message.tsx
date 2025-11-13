import { FileDownloadRound } from "@vicons/material"
import { until } from "@vueuse/core"
import { isError, isUndefined } from "es-toolkit"
import { isNumber, toString } from "es-toolkit/compat"
import { motion } from "motion-v"
import { NProgress, NIcon, } from "naive-ui"
import { Icon, Loading } from "vant"
import { computed, nextTick, Transition, TransitionGroup } from "vue"
import { reactive, ref, watch, type Reactive } from "vue"

export interface DownloadMessageProgress extends DownloadMessageLoading {
  /** 0~100 */  progress: number
}
export interface DownloadMessageLoading {
  description: string
  retryable: boolean
}
export interface DownloadMessageBind {
  createProgress<TResult>(title: string, fn: (ins: Reactive<DownloadMessageProgress>) => PromiseLike<TResult>): Promise<TResult>
  createLoading<TResult>(title: string, fn: (ins: Reactive<DownloadMessageLoading>) => PromiseLike<TResult>): Promise<TResult>
}
const allDownloadMessagesIsMinsize = reactive(new Array<boolean | undefined>())
export const createDownloadMessage = async <T,>(title: string, bind: (method: DownloadMessageBind) => PromiseLike<T>): Promise<T> => {
  const index = allDownloadMessagesIsMinsize.length
  allDownloadMessagesIsMinsize[index] = false
  const messageList = reactive(new Array<{
    title: string
    description: string
    retry?: () => any
    progress?: number
  } & ({
    state: 'success' | undefined
  } | {
    state: 'error'
    error: Error
  })>())
  const minsize = ref(false)
  const minsizeWatcher = watch(minsize, min => {
    if (min) allDownloadMessagesIsMinsize[index] = true
    else allDownloadMessagesIsMinsize[index] = false
  }, { immediate: true })
  const indexOnMinList = computed(() => {
    const afters = allDownloadMessagesIsMinsize.slice(0, index)
    return afters.filter(v => v).length
  })

  const message = window.$message.create(title, {
    render: $props => (<motion.div drag="y"
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragTransition={{ bounceStiffness: 500, bounceDamping: 15 }}
      variants={{
        minsize: {
          borderRadius: '100%',
          width: '30px',
          height: '30px',
          paddingInline: '2px',
          paddingBlock: '2px',
          position: 'fixed',
          left: `${indexOnMinList.value * 40 + 8}px`,
          top: 'calc(var(--safe-area-inset-top) + 4px)',
        },
        maxsize: {
          borderRadius: '8px',
          width: '90vw',
          paddingInline: '8px',
          paddingBlock: '12px',
          height: 'fit-content'
        }
      }}
      onDragEnd={(_, { offset }) => (offset.y < -30) && (minsize.value = true)}
      animate={minsize.value ? 'minsize' : 'maxsize'}
      class="bg-(--n-color) overflow-hidden"
      style={{ boxShadow: 'var(--n-box-shadow)' }}
    >
      <Transition name="van-fade">
        {
          minsize.value ?
            <div class="size-full relative" onClick={() => minsize.value = false}>
              <Loading class="absolute top-0 left-0 size-full" color="var(--p-color)" />
              <NIcon class="!absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 " size="18px" color="var(--p-color)">
                {
                  messageList.some(v => v.state == 'error') ?
                    <Icon name="cross" />
                    : <FileDownloadRound />
                }
              </NIcon>
            </div>
            :
            <div class="w-full relative">
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
                          processing={isUndefined(v.state)}
                          type="line"
                          showIndicator={false}
                          show-indicator={false}
                          class={["**:in-[.n-progress-graph-line-fill]:!hidden transition-all",
                            (v.state == 'error' && v.retry) ? '!w-[80%]' : '!w-[95%]'
                          ]}
                          height={7}
                          status={v.state}
                        />
                      }
                      <div class="text-xs text-(--van-text-color-2) !h-[1rem]">{(v.state == 'error' && (v.error.stack ?? `${v.error.name}: ${v.error.message}`)) || v.description || '...'}</div>
                    </div>
                  ))
                }
              </TransitionGroup>
              <div class="rounded-lg w-10 bg-(--nui-divider-color) h-1 absolute -bottom-2 left-1/2 -translate-x-1/2"></div>
            </div>
        }
      </Transition>
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
    let error = new Error
    const index = messageList.length
    const watcher = watch([_config, state], ([, state]) => {
      messageList[index] = {
        title,
        state,
        error,
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
          error = err
        } else {
          error = new Error(toString(err))
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
    pc.promise.finally(() => {

    })
    return pc.promise
  }

  const createProgress: DownloadMessageBind['createProgress'] = (title, fn) => {
    return createLine(title, { progress: 0 }, fn)
  }
  const createLoading: DownloadMessageBind['createLoading'] = (title, fn) => {
    return createLine(title, {}, fn)
  }
  const result = bind({
    createProgress,
    createLoading
  })
  await until(() => messageList.every(v => !isUndefined(v.state))).toBeTruthy()
  minsize.value = false
  await nextTick()
  minsizeWatcher.stop()
  await until(minsize).toBeTruthy()
  message.destroy()
  allDownloadMessagesIsMinsize[index] = undefined

  const maybeError = messageList.find(v => v.state == 'error')
  console.log('[maybeError]', maybeError, messageList)
  if (maybeError) throw maybeError.error

  return await result
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