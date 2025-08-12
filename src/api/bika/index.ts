import { useConfig } from "@/config"
import { useBikaStore } from "@/stores"
import eventBus from "@/utils/eventBus"
import { requestErrorHandleInterceptors as requestErrorInterceptors, requestErrorResult, useCapacitorAdapter } from "@/utils/request"
import { until, useOnline, type AnyFn } from "@vueuse/core"
import axios, { isAxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios"
import { enc, HmacSHA256 } from "crypto-js"
import { isEmpty, values } from "lodash-es"
import allProxy from './proxy.json'

import { _bikaComic } from "./comic"
import { _bikaImage } from "./image"
import { _bikaSearch } from "./search"
import { _bikaComment } from "./comment"
import { _bikaAuth } from "./auth"
import { _bikaUser } from "./user"
import { _bikaApiAuth } from "./api/auth"
import { _bikaApiComic } from "./api/comic"
import { _bikaApiComment } from "./api/comment"
import { _bikaApiSearch } from "./api/search"
import { _bikaApiUser } from "./api/user"


export namespace bika {
  export type ImageQuality = 'low' | 'medium' | 'high' | 'original'
  export type SortType = 'dd' | 'da' | 'ld' | 'vd'
  export type SearchMode = "id" | "pid" | "uploader" | "translator" | "author" | "keyword" | 'category' | 'tag'
  export interface FillerTag {
    name: string
    mode: "hidden" | "show" | "auto"
  }

  export const proxy = allProxy

  export import comic = _bikaComic
  export import auth = _bikaAuth
  export import user = _bikaUser
  export import image = _bikaImage
  export import search = _bikaSearch
  export import comment = _bikaComment
}


export namespace bika.api {
  export import auth = _bikaApiAuth
  export import comic = _bikaApiComic
  export import user = _bikaApiUser
  export import search = _bikaApiSearch
  export import comment = _bikaApiComment
}


export namespace bika.api.pica {
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
  export const api = axios.create({
    baseURL: '',
    adapter: useCapacitorAdapter,
    timeout: 10000,
    validateStatus: status => status >= 200 && status < 400,
  })
  api.interceptors.request.use(async requestConfig => {
    if (values(requestConfig.data).includes(undefined)) return requestErrorResult('networkError_request', 'some values is undefined')
    const config = useConfig()
    const baseInterface = bika.proxy.interface.find(v => config["bika.proxy.interfaceId"] == v.id)
    if (!baseInterface) return requestErrorResult('networkError_request', `Interface is empty (id=${config["bika.proxy.interfaceId"]})`)
    requestConfig.baseURL = `https://${baseInterface.basePart}.${baseInterface.url}`//import.meta.env.DEV ? '/$bk_api' : 
    await until(useOnline()).toBe(true)
    for (const value of getBikaApiHeaders(requestConfig.url ?? '/', requestConfig.method!.toUpperCase())) requestConfig.headers.set(...value)
    requestConfig.headers.set('use-interface', requestConfig.baseURL)
    return requestConfig
  })
  // api.interceptors.response.use(undefined, requestErrorInterceptors.passCorsError)
  api.interceptors.response.use(async (v: AxiosResponse<RawResponse>) => {
    if (v.data.error || v.data.data) return v
    if (!v.config.allowEmpty) return v
    return requestErrorResult('networkError_emptyData', v.data)
  }, err => {
    if (!isAxiosError(err)) return Promise.reject(err)
    if (err.response) return requestErrorResult('networkError_response', err)
    return Promise.reject(err)
  })
  api.interceptors.response.use(undefined, requestErrorInterceptors.createCheckIsUnauth(api, async () => {
    const bikaStore = useBikaStore()
    console.log(bikaStore.loginData, isEmpty(bikaStore.loginData.email), isEmpty(bikaStore.loginData.email))
    if (isEmpty(bikaStore.loginData.email) || isEmpty(bikaStore.loginData.email)) return false
    try {
      const { _bikaApiAuth } = await import('./api/auth')
      const loginResult = (await _bikaApiAuth.login(bikaStore.loginData)).data
      if (!loginResult) return false
      bikaStore.loginToken = loginResult.token
    } catch (error) {
      requestErrorResult('networkError_response', error)
      return false
    }
    return true
  }))
  api.interceptors.response.use(undefined, err => {
    if (err?.response && err.response.data.error == '1014') return Promise.resolve((<AxiosResponse>{ data: false, config: err.config, headers: err.response?.headers, status: 200, statusText: '200', request: err.request })) // only /comic/:id
    return Promise.reject(err)
  })
  api.interceptors.response.use(undefined, requestErrorInterceptors.isClientError)
  api.interceptors.response.use(undefined, requestErrorInterceptors.createAutoRetry(api, 10))

}
export namespace bika.api.pica.rest {
  export const get = async <T>(url: string, config: AxiosRequestConfig = {}) => requestErrorInterceptors.useUnreadableRetry(() => bika.api.pica.api.get<Response<T>>(url, config))
  export const post = async <T>(url: string, data?: any, config: AxiosRequestConfig = {}) => requestErrorInterceptors.useUnreadableRetry(() => bika.api.pica.api.post<Response<T>>(url, data, config))
  export const put = async <T>(url: string, data?: any, config: AxiosRequestConfig = {}) => requestErrorInterceptors.useUnreadableRetry(() => bika.api.pica.api.put<Response<T>>(url, data, config))

}


export namespace bika.api.recommend {
  export const api = axios.create({
    baseURL: '',
    adapter: useCapacitorAdapter,
    timeout: 5000
  })
  api.interceptors.request.use(async requestConfig => {
    if (values(requestConfig.data).includes(undefined)) return requestErrorResult('networkError_request', 'some values is undefined')
    const config = useConfig()
    const baseInterface = bika.proxy.interface.find(v => config["bika.proxy.interfaceId"] == v.id)
    if (!baseInterface) return requestErrorResult('networkError_request', `Interface is empty (id=${config["bika.proxy.interfaceId"]})`)
    requestConfig.baseURL = import.meta.env.DEV ? '/$bk_recommend' : `https://${baseInterface.recommendPart}.${baseInterface.url}`
    await until(useOnline()).toBe(true)
    requestConfig.headers.set('use-interface', requestConfig.baseURL)
    return requestConfig
  })
  api.interceptors.response.use(undefined, requestErrorInterceptors.isClientError)
  api.interceptors.response.use(undefined, requestErrorInterceptors.passCorsError)
  api.interceptors.response.use(undefined, requestErrorInterceptors.createAutoRetry(api, 3))

}
export namespace bika.api.recommend.rest {
  export const get = async <T>(url: string, config: AxiosRequestConfig = {}) => requestErrorInterceptors.useUnreadableRetry(() => bika.api.recommend.api.get<T>(url, config))
  export const post = async <T>(url: string, data?: any, config: AxiosRequestConfig = {}) => requestErrorInterceptors.useUnreadableRetry(() => bika.api.recommend.api.post<T>(url, data, config))
  export const put = async <T>(url: string, data?: any, config: AxiosRequestConfig = {}) => requestErrorInterceptors.useUnreadableRetry(() => bika.api.recommend.api.put<T>(url, data, config))
}

window.$api.bika = bika
