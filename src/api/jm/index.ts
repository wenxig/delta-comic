import { useConfig } from "@/config"
import { requestErrorHandleInterceptors } from "@/utils/request"
import { until, useOnline } from "@vueuse/core"
import axios, { type InternalAxiosRequestConfig } from "axios"
import { AES, enc, mode } from "crypto-js"
import md5 from 'md5'
export namespace jm { }

export namespace jm.api {
  const useAuthHeader = async (requestConfig: InternalAxiosRequestConfig<any>) => {
    const key = Date.now().toString()
    const token = md5(`${key}185Hcomic3PAPP7R`)
    const tokenParam = `${key},1.7.9`
    await until(useOnline()).toBe(true)
    requestConfig.jm_key = key
    requestConfig.headers.set('Key', key)
    requestConfig.headers.set('Token', token)
    requestConfig.headers.set('Tokenparam', tokenParam)
    requestConfig.headers.set('Use-interface', requestConfig.baseURL)
    const baseHeader = {
      "Accept": "*/*",
      "Accept-Encoding": "gzip, deflate, br, zstd",
      "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
      "Connection": "keep-alive",
      "Origin": "https://localhost",
      "Referer": "https://localhost/",
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "cross-site",
      "X-Requested-With": 'com.example.app',
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
    adapter: ["fetch", "xhr", "http"],
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
    res.data = decrypt(res.data)
    return res
  }, requestErrorHandleInterceptors.isClientError)
  api.interceptors.response.use(undefined, requestErrorHandleInterceptors.passCorsError)
  api.interceptors.response.use(undefined, requestErrorHandleInterceptors.createAutoRetry(api, 3))

  const listServer = axios.create({
    adapter: ["fetch", "xhr", "http"],
    timeout: 5000
  })
  listServer.interceptors.request.use(rc => {
    const config = useConfig()
    console.log(config["jm.proxy.middle"])
    rc.baseURL = config["jm.proxy.middle"]
    return rc
  })
  listServer.interceptors.request.use(useAuthHeader)
  listServer.interceptors.response.use(res => {
    const decrypted = AES.decrypt(res.data, enc.Utf8.parse(md5("diosfjckwpqpdfjkvnqQjsik")), { mode: mode.ECB })
    // 返回解密后的 JSON 数据
    res.data = JSON.parse(decrypted.toString(enc.Utf8))
    return Promise.resolve(res)
  }, requestErrorHandleInterceptors.isClientError)
  listServer.interceptors.response.use(undefined, requestErrorHandleInterceptors.passCorsError)
  listServer.interceptors.response.use(undefined, requestErrorHandleInterceptors.createAutoRetry(listServer, 3))

  export const getApiList = () => listServer.get('/server-2025.txt')
}
window.$api.jm = jm