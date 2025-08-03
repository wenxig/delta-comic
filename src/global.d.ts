import { type useMessage, type useLoadingBar, type useDialog } from 'naive-ui'
declare global {
  interface Window {
    $message: ReturnType<typeof useMessage>
    $loading: ReturnType<typeof useLoadingBar>
    $dialog: ReturnType<typeof useDialog>
    $api: Record<string, any>
  }
  interface Map<K, V> {
    toJSON(): [K, V][]
  }
  interface Set<T> {
    toJSON(): T[]
  }
}
declare module 'axios' {
  interface AxiosRequestConfig {
    __retryCount?: number
    disretry?: boolean
    allowEmpty?: boolean
  }
}
declare module 'vue-router' {
  interface Router {
    force: {
      push: Router['push']
      replace: Router['replace']
    }
  }
}