import axios from 'axios'
import { shallowRef } from 'vue'
import * as localforage from 'localforage'
import { createInstance } from 'localforage'
import { createRetryFunction, unionRequestAdapter } from '@/helper/net'
import dayjs from 'dayjs'

export namespace JM {
  console.log(localforage, createInstance)
  const db = createInstance({
    name: 'jm',
    storeName: 'jm',
    driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE],
    description: 'JM API data storage',
  })
  const dbKey = {
    proxysValue: 'proxys.value',
    proxysTimestamp: 'proxys.timestamp'
  }
  export const publishPage = (() => {
    const api = axios.create({
      adapter: unionRequestAdapter,
      baseURL: 'https://www.jmcomica.vip/',
      responseType: 'document',
      timeout: 10000
    })
    api.interceptors.response.use(undefined, createRetryFunction(api))
    return api
  })()
  export const init = async () => {
    await db.ready()
    // updateProxy
    const proxysTimestamp = await db.getItem<string>(dbKey.proxysTimestamp)
    if (proxysTimestamp && dayjs(proxysTimestamp).isBefore(dayjs(), 'days')) {
      const { data: doc } = await publishPage.get<Document>('/')
      const urls = [...doc.querySelectorAll('.wrap span')].map(v => v.innerHTML).slice(0, -4)
      await db.setItem(dbKey.proxysValue, urls)
      await db.setItem(dbKey.proxysTimestamp, dayjs().toString())
    }
  }
  export const html = (() => {
    const api = axios.create({
      timeout: 15000
    })
    api.interceptors.response.use()
  })()
}
