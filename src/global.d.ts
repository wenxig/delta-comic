import { type useMessage, type useLoadingBar, type useDialog } from 'naive-ui'
declare global {
  interface Window {
    $message: ReturnType<typeof useMessage>
    $loading: ReturnType<typeof useLoadingBar>
    $dialog: ReturnType<typeof useDialog>
    gmXmlHttpRequest?: GmXmlhttpRequestType
    $espace: any
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

interface GmResponseTypeMap {
  text: string
  json: any
  arraybuffer: ArrayBuffer
  blob: Blob
  document: Document
}

type GmResponseType = keyof GmResponseTypeMap
interface GmXmlhttpRequestOption<R extends GmResponseType, C = undefined> {
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
  responseType?: GmResponseType
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
interface GmXmlhttpRequestType {
  <R extends GmResponseType = "text", C = any>(
    details: GmXmlhttpRequestOption<R, C>,
  ): GmAbortHandle
}
interface GmReponseEventListener<Event> {
  (this: Event, event: Event): void
}
interface GmResponseEvent<R extends GmResponseType, C = undefined>
  extends GmResponseEventBase<R> {
  finalUrl: string
  context: C
}

interface GmProgressResponseEvent<R extends GmResponseType, C = undefined>
  extends GmResponseEvent<R, C>,
  GmProgressEventBase { }
interface GmProgressEventBase {
  done: number
  lengthComputable: boolean
  loaded: number
  position: number
  total: number
  totalSize: number
}

interface GmResponseEventBase<R extends GmResponseType> {
  responseHeaders: string
  /**
   * 0 = XMLHttpRequest.UNSENT
   *
   * 1 = XMLHttpRequest.OPENED
   *
   * 2 = XMLHttpRequest.HEADERS_RECEIVED
   *
   * 3 = XMLHttpRequest.HEADERS_RECEIVED
   *
   * 4 = XMLHttpRequest.DONE
   */
  readyState: 0 | 1 | 2 | 3 | 4
  response: GmResponseTypeMap[R]
  responseText: string
  responseXML: Document | null
  status: number
  statusText: string
}

interface GmAbortHandle<TReturn = void> {
  abort(): TReturn
}