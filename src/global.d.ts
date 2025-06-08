import { type useMessage, type useLoadingBar, type useDialog } from 'naive-ui'
declare global {
  interface Window {
    $message: ReturnType<typeof useMessage>
    $loading: ReturnType<typeof useLoadingBar>
    $dialog: ReturnType<typeof useDialog>
    gmXmlHttpRequest?: (opt: GmXmlhttpRequestOption) => {
      abort(): void
    }
  }
  // interface Map<K, V> {
  //   toJSON(): string
  //   toJSONObject(): [K, V][]
  // }
  // interface Set<T> {
  //   toJSON(): string
  //   toJSONObject(): T[]
  // }
  // interface Console {
  //   only(...arg: any[]): void
  // }
}
declare module 'vue-router' {
  interface Router {
    // force: {
    //   push: Router['push']
    //   replace: Router['replace']
    // }
  }
}
declare module 'axios' {
  interface AxiosRequestConfig {
    __retryCount?: number
    disretry?: boolean
  }
}
export { }

interface GmXmlhttpRequestOption {
  method?: string
  url: string
  headers?: Record<string, string>
  data?: BodyInit
  redirect?: `follow` | `error` | `manual`
  cookie?: string
  cookiePartition?: {
    topLevelSite?: string
  }
  binary?: boolean
  nocache?: boolean
  revalidate?: boolean
  timeout?: number
  context?: C
  responseType?: 'text' | 'json' | 'arraybuffer' | 'blob' | 'document'
  overrideMimeType?: string
  anonymous?: boolean
  fetch?: boolean
  user?: string
  password?: string
  onabort?: () => void
  onerror?: GmReponseEventListener<GmErrorEvent<R>>
  onloadstart?: GmReponseEventListener<GmResponseEvent<R, C>>
  onprogress?: GmReponseEventListener<GmProgressResponseEvent<R, C>>
  onreadystatechange?: GmReponseEventListener<GmResponseEvent<R, C>>
  ontimeout?: () => void
  onload?: GmReponseEventListener<GmResponseEvent<R, C>>
}
