import axios from 'axios'
import { shallowRef } from 'vue'
import * as localforage from 'localforage'
import { createRetryFunction } from '@/helper/net'
export namespace JM {
  const proxyOn = shallowRef<string>()
  const db = localforage.createInstance({
    name: 'jm',
    storeName: 'jm',
    driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE],
    description: 'JM API data storage',
  })
  export const publishPage = (() => {
    const api = axios.create({
      baseURL:'',
      adapter
    })
    api.interceptors.response.use(undefined, createRetryFunction(api))
    return api
  })()
  export const init = async () => {
    await db.ready()
  }
  export const api = (() => {
    const api = axios.create({

    })
    api.interceptors.response.use()
  })()
}

