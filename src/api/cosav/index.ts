import { useConfig } from "@/config"
import { requestErrorHandleInterceptors } from "@/utils/request"
import { until, useOnline } from "@vueuse/core"
import axios, { type InternalAxiosRequestConfig, type AxiosRequestConfig } from "axios"
import { AES, enc, MD5, mode, pad } from "crypto-js"
import { isString } from "lodash-es"
import { _cosavApiSearch } from "./api/search"
import { _cosavVideo } from "./video"
import { _cosavSearch } from "./search"
import { _cosavApiVideo } from "./api/video"
export namespace cosav {
  export type SearchMode = 'vid' | 'keyword' | 'category'
  export type SortType = '' | 'mv' | 'mr'
  export interface RawStream<T> {
    lastpage: number
    list: T[]
    totalCnt: string
  }

  export import search = _cosavSearch
  export import video = _cosavVideo
}
export namespace cosav.api {
  export import search = _cosavApiSearch
  export import video = _cosavApiVideo

  const useAuthHeader = async (requestConfig: InternalAxiosRequestConfig<any>) => {
    await until(useOnline()).toBe(true)
    const key = Date.now().toString()
    const tokenParam = `CosAppMakeBigMoney,${Math.floor(Date.now() / 1000)}`
    requestConfig.cosav_key = key
    requestConfig.headers.set('userParams', '')
    requestConfig.headers.set('Tokenparam', tokenParam)
    requestConfig.headers.set('Use-interface', requestConfig.baseURL)
    return requestConfig
  }
  export const api = axios.create({
    adapter: ['fetch', 'xhr', 'http'],
    timeout: 10000,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache'
    }
  })
  api.interceptors.request.use(rc => {
    const config = useConfig()
    rc.baseURL = config["cosav.proxy.interface"]
    return rc
  })
  api.interceptors.request.use(useAuthHeader)
  const cosKey = 'CosAppMakeBigMoneyCosplayAPPContent'
  const key = MD5(cosKey).toString()
  const keyHex = enc.Utf8.parse(key)
  api.interceptors.response.use(res => {
    const decrypt = (cipherText: string) => {
      const dData = AES.decrypt(cipherText, keyHex, {
        mode: mode.ECB,
        padding: pad.Pkcs7
      })
      const result = dData.toString(enc.Utf8)
      return JSON.parse(result)
    }
    if (isString(res.data.data)) res.data = decrypt(res.data.data)
    else res.data.data = res.data
    return res
  }, requestErrorHandleInterceptors.isClientError)
  api.interceptors.response.use(undefined, requestErrorHandleInterceptors.passCorsError)
  api.interceptors.response.use(undefined, requestErrorHandleInterceptors.createAutoRetry(api, 3))
}
export namespace cosav.api.rest {
  export const get = async <T>(url: string, config: AxiosRequestConfig = {}) => requestErrorHandleInterceptors.useUnreadableRetry(() => cosav.api.api.get<T>(url, config))
  export const post = async <T>(url: string, data?: any, config: AxiosRequestConfig = {}) => requestErrorHandleInterceptors.useUnreadableRetry(() => cosav.api.api.post<T>(url, data, config))
  export const postForm = async <T>(url: string, data?: any, config: AxiosRequestConfig = {}) => requestErrorHandleInterceptors.useUnreadableRetry(() => cosav.api.api.postForm<T>(url, data, {
    ...config,
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(config.headers || {}),
    },
  }))
  export const put = async <T>(url: string, data?: any, config: AxiosRequestConfig = {}) => requestErrorHandleInterceptors.useUnreadableRetry(() => cosav.api.api.put<T>(url, data, config))
}
window.$api.cosav = cosav