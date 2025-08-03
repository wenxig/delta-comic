import type { LoginData } from '@/api/bika/api/auth'
import symbol from '@/symbol'
import { useLocalStorage } from '@vueuse/core'
import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', () => {
  const chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678"
  const nonce = useLocalStorage(
    symbol.loginNonce,
    Array.from({ length: 32 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('').toLowerCase()
  )

  const loginToken = useLocalStorage(symbol.loginToken, '')
  const loginData = useLocalStorage<LoginData>(symbol.loginData, { email: '', password: '' })
  return { nonce, loginData, loginToken }
})