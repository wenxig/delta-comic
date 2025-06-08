import axios from 'axios'
import CryptoJS from 'crypto-js'

export namespace JM {
  export const api = (() => {
    const api = axios.create({

    })
    api.interceptors.response.use()
  })()
  export const html = (() => {
    const api = axios.create({

    })
    return api
  })()
}

