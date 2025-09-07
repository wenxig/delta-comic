import { until } from "@vueuse/core"
import { isEmpty, isEqual, last, random } from "lodash-es"
import { computed, markRaw, ref, shallowRef, type Raw, type Ref } from "vue"
import { SmartAbortController } from "./request"
import type { bika } from "@/api/bika"
import type { cosav } from "@/api/cosav"

export class PromiseContent<T, TPF extends any = T> implements PromiseLike<T> {
  public static isPromiseContent(value: unknown): value is PromiseContent<any> {
    return value instanceof this
  }
  constructor(private promise: Promise<T>, private processor: (v: T) => TPF = v => <any>v, private isPause = false) {
    if (!isPause) this.loadPromise(promise)
  }
  public resume() {
    if (this.isPause) return
    this.isPause = true
    this.loadPromise(this.promise)
  }
  public async loadPromise(promise: Promise<T>) {
    this.data.value = undefined
    this.isLoading.value = true
    this.isError.value = false
    this.errorCause.value = undefined
    this.isEmpty.value = true
    try {
      const v = await promise
      this.data.value = this.processor(v)
      this.isLoading.value = false
      this.isError.value = false
      this.isEmpty.value = isEmpty(v)
    } catch (err) {
      this.data.value = undefined
      this.isError.value = true
      this.errorCause.value = err
    }
  }
  public useProcessor<TP>(processor: (val: T) => TP): RPromiseContent<T, TP> {
    return PromiseContent.fromPromise(this.promise, processor)
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
  public data = shallowRef<TPF>()
  public isLoading = shallowRef(true)
  public isError = shallowRef(false)
  public errorCause = shallowRef<any>()
  public isEmpty = shallowRef(true)
  public static fromPromise<T, TP = T>(promise: Promise<T>, processor: (val: T) => TP = v => <any>v, isPause = false): RPromiseContent<T, TP> {
    const v = new this<T, TP>(promise, processor, isPause)
    return markRaw(v)
  }
  public static fromAsyncFunction<T extends (...args: any[]) => Promise<any>>(asyncFunction: T, isPause = false) {
    return (...args: Parameters<T>): RPromiseContent<Awaited<ReturnType<T>>> => this.fromPromise((() => asyncFunction(...args))(), undefined, isPause)
  }
  public static resolve<T>(data: T) {
    const pc = this.fromPromise(Promise.resolve(data))
    pc.isLoading.value = false
    return pc
  }
  public static withResolvers<T>(isLoading = false): PromiseWithResolvers<T> {
    let withResolvers = Promise.withResolvers<T>()
    const content = new this<T>(withResolvers.promise)
    content.isLoading.value = isLoading
    return {
      content,
      reject: (reason?: any) => {
        withResolvers.reject(reason)
      },
      resolve: (value: T | PromiseLike<T>) => {
        withResolvers.resolve(value)
      },
      reset(isLoading = false) {
        withResolvers = Promise.withResolvers<T>()
        content.loadPromise(withResolvers.promise)
        content.isLoading.value = isLoading
      }
    }
  }
}
export type PromiseWithResolvers<T> = {
  content: RPromiseContent<T>
  reject: (reason?: any) => void
  resolve: (value: T | PromiseLike<T>) => void
  reset: (isLoading?: boolean) => void
}

export type RPromiseContent<T, PTF = T> = Raw<PromiseContent<T, PTF>>
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
  public static bikaApiPackager<T>(api: (page: number, signal: AbortSignal) => PromiseLike<bika.api.pica.RawStream<T>>) {
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
  public static jmApiPackager<T>(api: (page: number, signal: AbortSignal) => PromiseLike<T[]>) {
    return Stream.create<T>(async function* (signal, that) {
      while (true) {
        if (that.pages.value <= that.page.value) return
        that.page.value++
        const result = await api(that.page.value, signal)
        if (isEqual(last(result), last(that._data))) return
        that.pages.value = that.page.value + 1
        if (that.page.value == 1) that.pageSize.value = result.length
        yield result
      }
    })
  }
  public static cosavApiPackager<T>(api: (page: number, signal: AbortSignal) => PromiseLike<cosav.RawStream<T>>) {
    return Stream.create<T>(async function* (signal, that) {
      while (true) {
        const result = await api(that.page.value, signal)
        that.page.value++
        that.pages.value = (Number(result.totalCnt) / 30)
        that.pageSize.value = 30
        that.total.value = Number(result.totalCnt)
        yield result.list
        if (result.list.length < 30) return
      }
    })
  }
  [x: symbol]: any
  private abortController = new SmartAbortController()
  private generator
  private _setupData = new Array<T>()
  public setupData(data: T[]) {
    this._setupData.push(...data)
    this.data.value.unshift(...data)
    return this
  }
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
      if (igRequesting) console.log('igRequesting next')
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
    this.data.value = this._setupData
    this.isDone.value = false
    this.isRequesting.value = false
    this.error.value = undefined
  }
  public async retry() {
    if (!this.error.value) this.page.value--
    return this.next()
  }
  public async nextToDone() {
    if (isNaN(this._pages)) await this.next(true)
    const promises = []
    // e.g. p:1 ps:20 2->20
    for (let index = this._page + 1; index <= this._pages; index++)  promises.push(this.next(true))
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
export const createClassFromResponse = async<T extends Record<string, any[]>, TResult>(source: PromiseLike<bika.api.pica.Response<T>>, box: new (source: T[keyof T][number]) => TResult, key: keyof T) => {
  const { data } = await source
  const s = data[key]
  return s.map(v => new box(v))
}
export const createClassFromResponseStream = async<T extends Record<string, bika.api.pica.RawStream<any>>, TResult>(v: Promise<bika.api.pica.Response<T>>, box: new (data: T[keyof T]['docs'][number]) => TResult, key: keyof T = 'comics'): Promise<bika.api.pica.RawStream<TResult>> => {
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
