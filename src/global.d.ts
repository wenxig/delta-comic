import type { Style } from '@capacitor/status-bar'
import { type useMessage, type useLoadingBar, type useDialog } from 'naive-ui'
declare global {
  interface Window {
    $message: ReturnType<typeof useMessage>
    $loading: ReturnType<typeof useLoadingBar>
    $dialog: ReturnType<typeof useDialog>
    $api: Record<string, any>
  }
}
declare module 'axios' {
  interface AxiosRequestConfig {
    __retryCount?: number
    disretry?: boolean
    allowEmpty?: boolean
    jm_key?: string
    cosav_key?: string
  }
}

declare module 'dexie' {
  interface Table<T = any, TKey = any, TInsertType = T, TRelation extends Record<string, any> = {}> {
    with(spec: Record<keyof TRelation, string>): Promise<Array<T & TRelation>>
  }
  interface Collection<T = any, TKey = any, TInsertType = T, TRelation extends Record<string, any> = {}> {
    with(spec: Record<keyof TRelation, string>): Promise<Array<T & TRelation>>
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