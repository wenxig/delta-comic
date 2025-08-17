import { useConfig } from "@/config"
import { requestErrorHandleInterceptors } from "@/utils/request"
import axios from "axios"
import { padStart } from "lodash-es"
import md5 from "md5"
export namespace _jmImage {
  const api = axios.create()
  api.interceptors.response.use(undefined, requestErrorHandleInterceptors.checkIsAxiosError)
  api.interceptors.response.use(undefined, requestErrorHandleInterceptors.createAutoRetry(api))
  export class Image {
    public rawUrl: string
    public static is(v: unknown): v is Image {
      return v instanceof Image
    }
    public static loadedImage = new Map<string, string>()
    private url: string
    constructor(url: string, private comicId?: number, private comicPage?: number) {
      const config = useConfig()
      this.url = `${config["jm.proxy.resource"]}/${url}`
      this.rawUrl = url
    }
    public width = 300
    public height = 400
    public async getUrl() {
      if (Image.loadedImage.has(this.url)) return Image.loadedImage.get(this.url)!
      if (!this.comicId) return this.url
      if (
        this.url.indexOf('.gif') > 0 ||
        (this.comicId < 220980)
      ) {
        return this.url
      }
      return await this.decryptImg()
    }
    public getChunkNumber() {
      if (!this.comicPage || !this.comicId) return NaN
      const page = padStart(this.comicPage.toString(), 5, '0')
      const data = md5(`${this.comicId}${page}`)
      const lastChar = data[data.length - 1]
      let key = lastChar.charCodeAt(0)
      if (268850 <= this.comicId && this.comicId <= 421925) key = key % 10
      else key = key % 8
      if (0 <= key && key <= 9) return key * 2 + 2
      else return 10
    }
    public static cache = new Map<string, Promise<string>>()
    public async decryptImg() {
      if (!this.comicPage || !this.comicId) return this.url
      // 避免重复解密
      if (Image.cache.has(this.url)) return await Image.cache.get(this.url)!
      const promise = Promise.withResolvers<string>()
      Image.cache.set(this.url, promise.promise)

      // 1) 获取 blob（确保图片允许 CORS）
      const blob = await requestErrorHandleInterceptors.useUnreadableRetry(() => api.get<Blob>(this.url, {
        responseType: 'blob'
      }))

      // 2) 用浏览器解码为 bitmap（支持 webp）
      const bitmap = await createImageBitmap(blob)
      const width = bitmap.width, height = bitmap.height

      // 3) 创建目标 canvas
      const canvas = document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")!

      // 4) 计算分段并按你的逻辑重组
      const segCount = this.getChunkNumber()
      const segH = Math.floor(height / segCount)
      const rem = height % segCount

      let ty0 = height - segH - rem
      let ty1 = height
      let dy = 0

      // 第一段
      ctx.drawImage(bitmap, 0, ty0, width, ty1 - ty0, 0, dy, width, ty1 - ty0)
      dy += segH + rem

      // 后续段
      for (let i = 1; i < segCount; i++) {
        ty0 -= segH
        ty1 -= segH
        ctx.drawImage(bitmap, 0, ty0, width, segH, 0, dy, width, segH)
        dy += segH
      }
      const dataurl = canvas.toDataURL("image/webp", 1)
      Image.loadedImage.set(this.url, dataurl)
      promise.resolve(dataurl)
      return dataurl
    }
  }
  export type Image_ = Image | string
}