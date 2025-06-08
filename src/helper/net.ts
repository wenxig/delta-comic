import type { AxiosAdapter, AxiosRequestConfig, AxiosResponse, AxiosInstance } from "axios"
import { isCancel, isAxiosError } from "axios"
import { fromPairs } from "lodash-es"
export const createRetryFunction = (api: AxiosInstance, times = 3) => async (err: any) => {
  if (isCancel(err) || !isAxiosError(err)) return Promise.reject(err)
  if (!err.config || err.config.disretry) return Promise.reject(err)
  if (err.config.__retryCount && err.config.__retryCount >= times) return Promise.reject(err)
  err.config.__retryCount = err.config?.__retryCount ?? 0
  err.config.__retryCount++
  return api(err.config)
}
export const unionRequestAdapter: AxiosAdapter = <T extends object>(requset: AxiosRequestConfig<T>) => {
  const { promise, resolve, reject } = Promise.withResolvers<AxiosResponse<T>>()
  const gmXmlHttpRequest = window.gmXmlHttpRequest
  const url = URL.parse(requset.url ?? '/', requset.baseURL)
  const stringifyHeaders: Record<string, string> = {}
  for (const key in requset.headers) {
    if (Object.prototype.hasOwnProperty.call(requset.headers, key)) {
      stringifyHeaders[key.toLowerCase()] = String(requset.headers[key])
    }
  }
  if (gmXmlHttpRequest) {
    if (requset.responseType == 'stream') throw new RangeError('responseType can not be "stream"')
    if (requset.responseType == 'formdata') requset.responseType = 'text'
    const { abort } = gmXmlHttpRequest<NonNullable<typeof requset.responseType>>({
      url: url?.toString()!,
      method: requset.method?.toLocaleUpperCase(),
      timeout: requset.timeout,
      headers: stringifyHeaders,
      ...(requset.auth ?? {}),
      cookie: requset.withCredentials ? document.cookie : undefined,
      data: JSON.stringify(requset.data),
      responseType: requset.responseType,
      anonymous: !requset.withCredentials,
      binary: requset.responseType == 'arraybuffer',
      nocache: true,
      onload(res) {
        const headers = fromPairs(res.responseHeaders.split('\r\n').map(v => {
          const r = v.split(':')
          r[0] = r[0].split('-').map(v => v.charAt(0).toUpperCase() + v.slice(1)).join('-')
          return r as [string, string]
        }))
        requset.headers = headers
        const config = {
          ...requset,
          headers: stringifyHeaders,
          url: url?.toString(),
          method: requset.method?.toLocaleUpperCase(),
        } as any
        const response: AxiosResponse<T> = {
          data: res.response as T,
          status: res.status,
          statusText: res.statusText,
          headers,
          config,
          request: res,
        }
        resolve(response)
        requset.signal?.removeEventListener?.('abort', abort)
      },
      onabort() {
        reject(new DOMException('The user aborted a request.', 'AbortError'))
        requset.signal?.removeEventListener?.('abort', abort)
      },
      ontimeout() {
        reject(new DOMException('The user aborted a request.(time outed)', 'AbortError'))
        requset.signal?.removeEventListener?.('abort', abort)
      },
      onerror(err) {
        reject(err)
        requset.signal?.removeEventListener?.('abort', abort)
      }
    })
    requset.signal?.addEventListener?.('abort', abort, { once: true })
    return promise
  }
  try {
    if (!plus.net.XMLHttpRequest) throw new Error('can not find any XMLHttpRequest implementation')
  } catch {
    throw new Error('can not find any XMLHttpRequest implementation')
  }
  const xhr = new plus.net.XMLHttpRequest()!
  xhr.open(requset.method?.toLocaleUpperCase() ?? 'GET', url?.toString(), requset.auth?.username, requset.auth?.password)
  xhr.withCredentials = requset.withCredentials ?? false
  xhr.timeout = requset.timeout
  for (const key in stringifyHeaders) {
    if (Object.prototype.hasOwnProperty.call(stringifyHeaders, key)) {
      xhr.setRequestHeader(key, stringifyHeaders[key])
    }
  }
  if (requset.responseType) {
    xhr.responseType = requset.responseType
  }
  const abort = () => {
    xhr.abort()
    reject(new DOMException('The user aborted a request.', 'AbortError'))
  }
  if (requset.signal) requset.signal?.addEventListener?.('abort', abort, { once: true })
  xhr.onload = () => {
    const headers = fromPairs(xhr.getAllResponseHeaders().split('\r\n').map(v => {
      const r = v.split(':')
      r[0] = r[0].split('-').map(v => v.charAt(0).toUpperCase() + v.slice(1)).join('-')
      return r as [string, string]
    }))
    requset.headers = headers
    const config = {
      ...requset,
      headers: stringifyHeaders,
      url: requset.url!,
      method: requset.method?.toLocaleUpperCase(),
    } as any
    const response: AxiosResponse<T> = {
      data: xhr.response! as any as T,
      status: xhr.status!,
      statusText: xhr.statusText!,
      headers,
      config,
      request: xhr,
    }
    resolve(response)
  }
  xhr.onerror = (err) => {
    reject(err)
    requset.signal?.removeEventListener?.('abort', abort)
  }
  xhr.ontimeout = () => {
    reject(new DOMException('The user aborted a request.(time outed)', 'AbortError'))
    requset.signal?.removeEventListener?.('abort', abort)
  }
  xhr.onabort = () => {
    reject(new DOMException('The user aborted a request.', 'AbortError'))
    requset.signal?.removeEventListener?.('abort', abort)
  }
  xhr.send(requset.data ? JSON.stringify(requset.data) : undefined)
  return promise
}