import { until } from "@vueuse/core"
import { isEmpty } from "lodash-es"
import { computed,  markRaw, ref, shallowReactive, shallowRef, type Raw, type Ref, type ShallowReactive } from "vue"
import { SmartAbortController } from "./request"
import type { Response, RawStream } from "@/api/bika"

export class PromiseContent<T> implements PromiseLike<T> {
  public static isPromiseContent(value: unknown): value is PromiseContent<any>{
    return value instanceof this
  }
  constructor(private promise: Promise<T>, private _isEmpty: (v: Awaited<T>) => boolean = isEmpty) {
    this.loadPromise(promise)
  }
  public loadPromise(promise: Promise<T>) {
    this.data = undefined
    this.isLoading = true
    this.isError = false
    this.errorCause = undefined
    this.isEmpty = true

    promise.then(async val => {
      const v = await val
      this.data = v
      this.isLoading = false
      this.isError = false
      this.isEmpty = this._isEmpty(v)
    })
    promise.catch(err => {
      this.data = undefined
      this.isError = true
      this.errorCause = err
    })
  }
  public catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null | undefined): Promise<T | TResult> {
    return this.promise.catch<TResult>(onrejected)
  }
  public then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null | undefined, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined): Promise<TResult1 | TResult2> {
    return this.promise.then<TResult1, TResult2>(onfulfilled, onrejected)
  }
  public finally(onfinally?: (() => void) | null | undefined): Promise<T> {
    return this.promise.finally(onfinally)
  }
  public data?: T
  public isLoading = true
  public isError = false
  public errorCause: any = undefined
  public isEmpty = true
  public static fromPromise<T>(promise: Promise<T>, _isEmpty: (v: Awaited<T>) => boolean = isEmpty) {
    const v = new this<T>(promise, _isEmpty)
    return shallowReactive(v)
  }
  public static fromAsyncFunction<T extends (...args: any[]) => Promise<any>>(asyncFunction: T, _isEmpty: (v: Awaited<T>) => boolean = isEmpty) {
    return (...args: Parameters<T>): SPromiseContent<Awaited<ReturnType<T>>> => this.fromPromise((() => {
      return asyncFunction(...args)
    })())
  }
  public static withResolvers<T>(isLoading = false) {
    let withResolvers = Promise.withResolvers<T>()
    const content = ref(this.fromPromise<T>(withResolvers.promise))
    content.value.isLoading = isLoading
    return {
      content,
      reject: (reason?: any) => {
        withResolvers.reject(reason)
      },
      resolve: (value: T | PromiseLike<T>) => {
        withResolvers.resolve(value)
      },
      reset() {
        withResolvers = Promise.withResolvers<T>()
        content.value.loadPromise(withResolvers.promise)
      }
    }
  }
}

export type SPromiseContent<T> = ShallowReactive<PromiseContent<T>>
type RawGenerator<T> = (abortSignal: AbortSignal, that: Stream<T>) => (IterableIterator<T[], void, Stream<T>> | AsyncIterableIterator<T[], void, Stream<T>>)
const generatorMap = new Map<Stream<any>, RawGenerator<any>>()
export type RStream<T> = Raw<Stream<T>>
export class Stream<T> implements AsyncIterableIterator<T[], void> {
  constructor(rawGenerator: RawGenerator<T>) {
    this.generator = rawGenerator(this.abortController.signal, this)
    generatorMap.set(this, rawGenerator)
    this[Stream.isStreamKey] = true
    // console.trace('stream new', this)
  }
  private static isStreamKey = Symbol('stream')
  public static isStream(stream: any): stream is Stream<any> {
    return !!stream[this.isStreamKey]
  }
  public static create<T>(generator: RawGenerator<T>) {
    const stream = new this<T>(generator)
    return markRaw(stream)
  }
  public static apiPackager<T>(api: (page: number, signal: AbortSignal) => PromiseLike<RawStream<T>>) {
    return Stream.create<T>(async function* (signal, that) {
      while (true) {
        if (that.pages.value <= that.page.value) return
        that.page.value++
        const result = await api(that.page.value, signal)
        that.pages.value = result.pages
        that.total.value = result.total
        that.pageSize.value = result.limit
        that.page.value = Number(result.page)
        yield result.docs
      }
    })
  }
  [x: symbol]: any
  private abortController = new SmartAbortController()
  private generator
  public async next(igRequesting = false): Promise<IteratorResult<T[], void>> {
    try {
      if (!igRequesting) {
        await until(this.isRequesting).toBe(false)
        this.isRequesting.value = true
      }
      if (this._isDone) {
        if (!igRequesting) this.isRequesting.value = false
        return { done: true, value: undefined }
      }
      const { value, done } = await this.generator.next(this)
      this.isDone.value = done ?? false
      if (!igRequesting) this.isRequesting.value = false
      if (done) return { done: true, value: undefined }
      this.data.value.push(...value)
      return { value, done }
    } catch (error) {
      if (!igRequesting) this.isRequesting.value = false
      this.error.value = error as Error
      throw error
    }
  }
  public async return(): Promise<IteratorResult<T[], void>> {
    return await this.generator.return?.() ?? { value: undefined, done: true }
  }
  public async throw(e?: any): Promise<IteratorResult<T[], void>> {
    return await this.generator.throw?.(e) ?? { value: undefined, done: true }
  }
  public reset() {
    const rawGenerator = generatorMap.get(this)!
    this.generator = rawGenerator(this.abortController.signal, this)
    this.total.value = NaN
    this.page.value = 0
    this.pageSize.value = NaN
    this.data.value = []
    this.isDone.value = false
    this.isRequesting.value = false

  }
  public async retry() {
    if (!this.error.value) this.page.value--
    return this.next()
  }
  public async nextToDone() {
    if (isNaN(this._pages)) await this.next()
    const promises = []
    // e.g. p:1 ps:20 2->20
    for (let index = this._page + 1; index < this._pages; index++)  promises.push(this.next(true))
    await Promise.all(promises)
    return this._data
  }
  public stop() {
    this.abortController.abort()
    this.isRequesting.value = false
  }
  public [Symbol.asyncIterator]() {
    return this
  }
  public error = shallowRef<void | Error>()

  public data = ref<T[]>([]) as Ref<T[]>
  public get _data() {
    return this.data.value
  }
  /** 当前页 */
  public page = shallowRef(0)
  /** 当前页 */
  public get _page() {
    return this.page.value
  }
  /** 总页数 */
  public pages = shallowRef(NaN)
  /** 总页数 */
  public get _pages() {
    return this.pages.value
  }
  /** 总条目数 */
  public total = shallowRef(NaN)
  /** 总条目数 */
  public get _total() {
    return this.total.value
  }
  /** 单页条目数 */
  public pageSize = shallowRef(NaN)
  /** 单页条目数 */
  public get _pageSize() {
    return this.pageSize.value
  }
  /** 数据当前总数 */
  public length = computed(() => this.data.value.length)
  /** 数据当前总数 */
  public get _length() {
    return this.data.value.length
  }
  public isRequesting = shallowRef(false)
  public get _isRequesting() {
    return this.isRequesting.value
  }
  public isDone = shallowRef(false)
  public get _isDone() {
    return this.isDone.value
  }
  public isNoData = computed(() => this.isDone.value && this.isEmpty.value)
  public get _isNoData() {
    return this.isNoData.value
  }
  public isEmpty = computed(() => this.length.value == 0)
  public get _isEmpty() {
    return this.isEmpty.value
  }
}
export const createClassFromResponse = async<T extends Record<string, any[]>, TResult>(source: PromiseLike<Response<T>>, box: new (source: T[keyof T][number]) => TResult, key: keyof T) => {
  const { data } = await source
  const s = data[key]
  return s.map(v => new box(v))
}
export const createClassFromResponseStream = async<T extends Record<string, RawStream<any>>, TResult>(v: Promise<Response<T>>, box: new (data: T[keyof T]['docs'][number]) => TResult, key: keyof T = 'comics'): Promise<RawStream<TResult>> => {
  const { data } = await v
  const s = data[key]
  s.docs = s.docs.map(v => new box(v))
  return s
}

export const callbackToPromise = <T = void>(fn: (resolve: (result: T | PromiseLike<T>) => void) => any) => {
  const { resolve, promise } = Promise.withResolvers<T>()
  fn(resolve)
  return promise
}