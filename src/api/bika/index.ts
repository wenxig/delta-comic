import { useConfig } from "@/config"
import { useBikaStore } from "@/stores"
import eventBus from "@/utils/eventBus"
import { requestErrorHandleInterceptors as requestErrorInterceptors, requestErrorResult } from "@/utils/request"
import { until, useOnline } from "@vueuse/core"
import axios, { isAxiosError, type AxiosResponse } from "axios"
import { enc, HmacSHA256 } from "crypto-js"
import { isEmpty, values } from "lodash-es"
import allProxy from '../bika_proxy.json'
export type BKImageQuality = 'low' | 'medium' | 'high' | 'original'
export type BKSortType = 'dd' | 'da' | 'ld' | 'vd'
export type BKSearchMode = "id" | "pid" | "uploader" | "translator" | "author" | "keyword" | 'category' | 'tag'
export interface FillerTag {
  name: string
  mode: "hidden" | "show" | "auto"
}
export type RawResponse<T = any> = {
  message: string,
  code: 200,
  data?: T,
  error?: undefined
} | {
  message: string,
  code: number,
  data: undefined,
  error: string
}
export type Response<T = any> = {
  message: string,
  code: 200,
  data: T,
}
export interface RawStream<T> {
  docs: T[]
  limit: number
  page: string | number
  pages: number
  total: number
}


eventBus.on('networkError_unauth', () => {
  const bikaStore = useBikaStore()
  bikaStore.loginToken = ''
})
const getBikaApiHeaders = (pathname: string, method: string) => {
  type Headers = [name: string, value: string][]
  pathname = pathname.substring(1)
  const requestTime = (new Date().getTime() / 1000).toFixed(0)
  const bikaStore = useBikaStore()
  const config = useConfig()
  const rawSignature = `${pathname}${requestTime}${bikaStore.nonce}${method}C69BAF41DA5ABD1FFEDC6D2FEA56B`.toLowerCase()
  const headers: Headers = [
    ['app-channel', '1'],
    ['app-uuid', 'webUUID'],
    ['accept', 'application/vnd.picacomic.com.v1+json'],
    ['app-platform', 'android'],
    ['Content-Type', 'application/json; charset=UTF-8'],
    ['time', requestTime],
    ['nonce', bikaStore.nonce],
    ['image-quality', config["bika.read.imageQuality"]],
    ['signature', HmacSHA256(rawSignature, '~d}$Q7$eIni=V)9\\RK/P.RM4;9[7|@/CA}b~OW!3?EV`:<>M7pddUBL5n|0/*Cn').toString(enc.Hex)],
    ['raw-signature', rawSignature]
  ]
  if (!isEmpty(bikaStore.loginToken)) headers.push(['authorization', bikaStore.loginToken])
  return headers
}
export const picapi = axios.create({
  baseURL: '',
  adapter: ["fetch", "xhr", "http"],
  timeout: 10000
})
picapi.interceptors.request.use(async requestConfig => {
  if (values(requestConfig.data).includes(undefined)) return requestErrorResult('networkError_request', 'some values is undefined')
  const config = useConfig()
  const baseInterface = allProxy.interface.find(v => config["bika.proxy.interfaceId"] == v.id)
  if (!baseInterface) return requestErrorResult('networkError_request', `Interface is empty (id=${config["bika.proxy.interfaceId"]})`)
  requestConfig.baseURL = import.meta.env.DEV ? '/$bk_api' : `https://${baseInterface.basePart}.${baseInterface.url}`
  await until(useOnline()).toBe(true)
  for (const value of getBikaApiHeaders(requestConfig.url ?? '/', requestConfig.method!.toUpperCase())) requestConfig.headers.set(...value)
  requestConfig.headers.set('use-interface', requestConfig.baseURL)
  return requestConfig
})
picapi.interceptors.response.use(undefined, requestErrorInterceptors.passCorsError)
picapi.interceptors.response.use(async (v: AxiosResponse<RawResponse>) => {
  if (v.data.error || v.data.data) return v
  if (!v.config.allowEmpty) return v
  return requestErrorResult('networkError_emptyData', v.data)
}, err => {
  if (!isAxiosError(err)) return Promise.reject(err)
  if (err.response) return requestErrorResult('networkError_response', err)
  return Promise.reject(err)
})
picapi.interceptors.response.use(undefined, requestErrorInterceptors.createCheckIsUnauth(picapi, async () => {
  const bikaStore = useBikaStore()
  console.log(bikaStore.loginData, isEmpty(bikaStore.loginData.email), isEmpty(bikaStore.loginData.email))
  if (isEmpty(bikaStore.loginData.email) || isEmpty(bikaStore.loginData.email)) return false
  try {
    const bikaApiAuth = await import('./api/auth')
    const loginResult = (await bikaApiAuth.login(bikaStore.loginData)).data
    if (!loginResult) return false
    bikaStore.loginToken = loginResult.token
  } catch (error) {
    requestErrorResult('networkError_response', error)
    return false
  }
  return true
}))
picapi.interceptors.response.use(undefined, err => {
  if (err?.response && err.response.data.error == '1014') return Promise.resolve((<AxiosResponse>{ data: false, config: err.config, headers: err.response?.headers, status: 200, statusText: '200', request: err.request })) // only /comic/:id
  return Promise.reject(err)
})
picapi.interceptors.response.use(undefined, requestErrorInterceptors.isClientError)
picapi.interceptors.response.use(undefined, requestErrorInterceptors.createAutoRetry(picapi, 10))

export const recommend = axios.create({
  baseURL: '',
  adapter: ["fetch", "xhr", "http"],
  timeout: 5000
})
recommend.interceptors.request.use(async requestConfig => {
  if (values(requestConfig.data).includes(undefined)) return requestErrorResult('networkError_request', 'some values is undefined')
  const config = useConfig()
  const baseInterface = allProxy.interface.find(v => config["bika.proxy.interfaceId"] == v.id)
  if (!baseInterface) return requestErrorResult('networkError_request', `Interface is empty (id=${config["bika.proxy.interfaceId"]})`)
  requestConfig.baseURL = import.meta.env.DEV ? '/$bk_recommend' : `https://${baseInterface.recommendPart}.${baseInterface.url}`
  await until(useOnline()).toBe(true)
  requestConfig.headers.set('use-interface', requestConfig.baseURL)
  return requestConfig
})
recommend.interceptors.response.use(undefined, requestErrorInterceptors.isClientError)
recommend.interceptors.response.use(undefined, requestErrorInterceptors.passCorsError)
recommend.interceptors.response.use(undefined, requestErrorInterceptors.createAutoRetry(recommend, 3))

import type { AxiosRequestConfig } from "axios"
export namespace picapiRest {
  export const get = async <T>(url: string, config: AxiosRequestConfig = {}): Promise<Response<T>> => {
    try {
      return (await picapi.get<Response<T>>(url, config)).data
    } catch (error) {
      if (error instanceof Error && error.message.includes('Illegal invocation')) {
        return await get<T>(url, config)
      }
      throw error
    }
  }
  export const post = async <T>(url: string, data?: any, config: AxiosRequestConfig = {}): Promise<Response<T>> => {
    try {
      return (await picapi.post<Response<T>>(url, data, config)).data
    } catch (error) {
      if (error instanceof Error && error.message.includes('Illegal invocation')) {
        return await post<T>(url, data, config)
      }
      throw error
    }
  }
  export const put = async <T>(url: string, data?: any, config: AxiosRequestConfig = {}): Promise<Response<T>> => {
    try {
      return (await picapi.put<Response<T>>(url, data, config)).data
    } catch (error) {
      if (error instanceof Error && error.message.includes('Illegal invocation')) {
        return await put<T>(url, data, config)
      }
      throw error
    }
  }

}
export namespace recommendRest {
  export const get = async <T>(url: string, config: AxiosRequestConfig = {}) => (await recommend.get<T>(url, config)).data
  export const post = async <T>(url: string, data?: any, config: AxiosRequestConfig = {}) => (await recommend.post<T>(url, data, config)).data
  export const put = async <T>(url: string, data?: any, config: AxiosRequestConfig = {}) => (await recommend.put<T>(url, data, config)).data
}
