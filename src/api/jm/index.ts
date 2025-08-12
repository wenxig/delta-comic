import { useConfig } from "@/config"
import { requestErrorHandleInterceptors, useCapacitorAdapter } from "@/utils/request"
import { until, useOnline } from "@vueuse/core"
import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from "axios"
import { AES, enc, mode } from "crypto-js"
import md5 from 'md5'
import { _jmAuth } from "./auth"
import { _jmUser } from "./user"
import { _jmImage } from "./image"
import { _jmSearch } from "./search"
import { _jmComic } from "./comic"
import { _jmApiAuth } from "./api/auth"
import { _jmApiSearch } from "./api/search"
import { _jmApiComic } from "./api/comic"
export namespace jm {
  export import auth = _jmAuth
  export import comic = _jmComic
  export import search = _jmSearch
  export import user = _jmUser
  export import image = _jmImage
}

export namespace jm.api {
  export import auth = _jmApiAuth
  export import search = _jmApiSearch
  export import comic = _jmApiComic
  const key = Date.now().toString()
  const token = md5(`${key}185Hcomic3PAPP7R`)
  const tokenParam = `${key},1.7.9`

  const useAuthHeader = async (requestConfig: InternalAxiosRequestConfig<any>) => {
    await until(useOnline()).toBe(true)
    requestConfig.jm_key = key
    requestConfig.headers.set('Key', key)
    requestConfig.headers.set('Token', token)
    requestConfig.headers.set('Tokenparam', tokenParam)
    requestConfig.headers.set('Use-interface', requestConfig.baseURL)
    const baseHeader = {
      "Accept": "*/*",
      "Accept-Encoding": "gzip",
      "Connection": "keep-alive",
      version: "v1.2.9"
    }
    for (const key in baseHeader) {
      if (Object.prototype.hasOwnProperty.call(baseHeader, key)) {
        const element = baseHeader[<keyof typeof baseHeader>key]
        requestConfig.headers.set(key, element)
      }
    }
    return requestConfig
  }
  export const api = axios.create({
    adapter: useCapacitorAdapter,
    timeout: 10000
  })
  api.interceptors.request.use(rc => {
    const config = useConfig()
    rc.baseURL = import.meta.env.DEV ? '/$jm_api' : config["jm.proxy.interface"]
    return rc
  })
  api.interceptors.request.use(useAuthHeader)
  api.interceptors.response.use(res => {
    const keyTemplates: string[] = [
      "185Hcomic3PAPP7R",
      "18comicAPPContent",
    ] // 预定义的密钥模板
    const decrypt = (cipherText: string) => {
      for (const template of keyTemplates) {
        try {
          const dynamicKey = md5(res.config.jm_key + template)
          const decrypted = AES.decrypt(cipherText, enc.Utf8.parse(dynamicKey), {
            mode: mode.ECB,
          })
          return JSON.parse(decrypted.toString(enc.Utf8))
        } catch (e) {
          // 尝试下一个密钥模板
          continue
        }
      }
      throw new Error("Decryption failed")
    }
    if (res.data.data) res.data = decrypt(res.data.data)
    return res
  }, requestErrorHandleInterceptors.isClientError)
  // api.interceptors.response.use(undefined, requestErrorHandleInterceptors.passCorsError)
  api.interceptors.response.use(undefined, requestErrorHandleInterceptors.createAutoRetry(api, 3))
  // https://app.ggo.icu/JMComic/config.txt?version=v1.2.9&platform=macOS-15.6-x86_64-i386-64bit
}
export namespace jm.api.rest {
  export const get = async <T>(url: string, config: AxiosRequestConfig = {}) => requestErrorHandleInterceptors.useUnreadableRetry(() => jm.api.api.get<T>(url, config))
  export const post = async <T>(url: string, data?: any, config: AxiosRequestConfig = {}) => requestErrorHandleInterceptors.useUnreadableRetry(() => jm.api.api.post<T>(url, data, config))
  export const postForm = async <T>(url: string, data?: any, config: AxiosRequestConfig = {}) => requestErrorHandleInterceptors.useUnreadableRetry(() => jm.api.api.postForm<T>(url, data, config))
  export const put = async <T>(url: string, data?: any, config: AxiosRequestConfig = {}) => requestErrorHandleInterceptors.useUnreadableRetry(() => jm.api.api.put<T>(url, data, config))
}
window.$api.jm = jm