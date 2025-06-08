import type { AxiosAdapter } from "axios"
import { isCancel, isAxiosError, type AxiosInstance } from "axios"

export const createRetryFunction = (api: AxiosInstance, times = 3) => async (err: any) => {
  if (isCancel(err) || !isAxiosError(err)) return Promise.reject(err)
  if (!err.config || err.config.disretry) return Promise.reject(err)
  if (err.config.__retryCount && err.config.__retryCount >= times) return Promise.reject(err)
  err.config.__retryCount = err.config?.__retryCount ?? 0
  err.config.__retryCount++
  return api(err.config)
}
export const createUnionRequestFunction: AxiosAdapter = async (e) => {

}