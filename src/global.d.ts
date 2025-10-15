import type { Style } from '@capacitor/status-bar'
import { type useMessage, type useLoadingBar, type useDialog } from 'naive-ui'
import type { Pinia } from 'pinia'
import type { useRoute } from 'vue-router'
import { ExternalLibKey } from '../external'
import type { Router } from 'vue-router'
import type { uni } from 'delta-comic-core'
declare global {
  interface Window {
    $message: ReturnType<typeof useMessage>
    $loading: ReturnType<typeof useLoadingBar>
    $dialog: ReturnType<typeof useDialog>
    $api: Record<string, any>
    $$lib$$: Record<ExternalLibKey[keyof ExternalLibKey], any>
    $$safe$$: boolean
    $router: Router
    $layout: Record<string, uni.content.ViewLayoutComp>
    $isDev: boolean
  }
}
declare module 'axios' {
  interface AxiosRequestConfig {
    __retryCount?: number
    disretry?: boolean
  }
}

declare module 'dexie' {
  interface Table<T = any, TKey = any, TInsertType = T, TRelation extends Record<string, any> = {}> {
    with<T2 extends Record<string, any> = TRelation>(spec: Record<keyof TRelation, string>): Promise<Array<T & T2>>
  }
  interface Collection<T = any, TKey = any, TInsertType = T, TRelation extends Record<string, any> = {}> {
    with<T2 extends Record<string, any> = TRelation>(spec: Record<keyof TRelation, string>): Promise<Array<T & T2>>
  }
}

declare module 'vue-router' {
  interface Router {
    force: {
      push: Router['push']
      replace: Router['replace']
    }
  }
  interface RouteMeta {
    statusBar?: {
      overlaysWebView?: boolean
      style?: Style
      backgroundColor?: string
    }
    force?: boolean
  }
}
export { }

