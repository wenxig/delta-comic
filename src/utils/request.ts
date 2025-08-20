import { type AxiosInstance, isCancel, isAxiosError, type AxiosError, type AxiosAdapter, type AxiosResponse, formToJSON } from "axios"
import mitt from "mitt"
import eventBus, { type EventBus } from "./eventBus"
import { delay } from "./delay"

export class SmartAbortController implements AbortController {
  private _controller = new AbortController()
  private mitt = mitt<{
    abort: void
  }>()
  public get signal() {
    return this._controller.signal
  };
  public abort(reason?: any): void {
    this._controller.abort(reason)
    this._controller = new AbortController()
    this.mitt.emit('abort')
  }
  public onAbort(fn: () => any) {
    this.mitt.on('abort', fn)
    return () => this.mitt.off('abort', fn)
  }
  public onAbortOnce(fn: () => any) {
    const handler = async () => {
      await fn()
      this.mitt.off('abort', handler)
    }
    this.mitt.on('abort', handler)
  }
}
export const uuid = () => 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'.replace(/x/g, function (c) {
  const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8)
  return v.toString(16)
})
export const requestErrorResult = (errType: keyof EventBus, err: any) => {
  eventBus.emit(errType, err)
  return Promise.reject(err)
}
export namespace requestType {
  export const isPost = (v: { config: { method?: string } }) => /post/ig.test(v.config.method ?? '')
  export const isPut = (v: { config: { method?: string } }) => /put/ig.test(v.config.method ?? '')
  export const isGet = (v: { config: { method?: string } }) => /get/ig.test(v.config.method ?? '')
}
export namespace requestErrorHandleInterceptors {
  export const checkIsAxiosError = <T extends object>(err: any): err is AxiosError<T, any> => {
    if ('__isAxiosError' in err) return <boolean>err.__isAxiosError
    return err.__isAxiosError = !isCancel(err) && isAxiosError(err)
  }

  export const useUnreadableRetry = async <T extends () => Promise<AxiosResponse>>(fn: T, times = 0): Promise<Awaited<ReturnType<T>>['data']> => {
    try {
      return (await fn()).data
    } catch (error) {
      if (error instanceof Error && ((error.message.includes('Illegal invocation') || error.name.includes('TypeError')))) {
        if (times > 20) {
          throw error
        }
        return await useUnreadableRetry(fn, times + 1)
      }
      throw error
    }
  }

  export const useForceRetry = async <T extends () => Promise<AxiosResponse>>(fn: T, times = 0): Promise<Awaited<ReturnType<T>>['data']> => {
    try {
      return (await fn()).data
    } catch (error) {
      if (error instanceof Error) {
        if (times > 20) {
          throw error
        }
        return await useForceRetry(fn, times + 1)
      }
      throw error
    }
  }

  export const createAutoRetry = (api: AxiosInstance, times = 3) => async (err: any) => {
    if (!checkIsAxiosError(err)) return Promise.reject(err)
    if (!err.config || err.config.disretry || (err.config.__retryCount ?? 0) >= times) throw requestErrorResult('networkError_response', err)
    err.config.__retryCount = (err.config.__retryCount ?? 0) + 1
    await delay(500 * err.config.__retryCount)
    return api(err.config)
  }
  export const createCheckIsUnauth = (api: AxiosInstance, relogin?: () => Promise<boolean>) => {
    return async (err: any) => {
      if (!checkIsAxiosError(err)) return Promise.reject(err)
      if (err?.response?.status == 401) {
        if (relogin) {
          if (!await relogin()) throw requestErrorResult('networkError_unauth', err)
          return api(err.config ?? {})
        }
        else if (!location.pathname.includes('auth')) throw requestErrorResult('networkError_unauth', err)
      }
      return Promise.reject(err)
    }
  }
  export const isClientError = (err: any) => {
    if (err?.response?.status?.toString().startsWith('4')) throw requestErrorResult('networkError_response', err)
    return Promise.reject(err)
  }
  export const passCorsError = (err: any) => {
    if (!checkIsAxiosError(err)) return Promise.reject(err)
    if (err.code == "ERR_NETWORK" && !err.response) throw requestErrorResult('networkError_request', err)
    return Promise.reject(err)
  }
}

import { Capacitor } from '@capacitor/core'
export const createProxyBaseUrl = (dev: string, base: string) => {
  return base
  if (Capacitor.isNativePlatform()) {
    return base
  }
  if (import.meta.env.PROD) {
    return base
  }
  return dev
}