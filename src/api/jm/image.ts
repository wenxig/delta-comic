import { useConfig } from "@/config"
import { Jimp, JimpMime } from "jimp"
import { padStart } from "lodash-es"
import md5 from "md5"
export namespace _jmImage {
  export class Image {
    public static is(v: unknown): v is Image {
      return v instanceof Image
    }
    public static loadedImage = new Map<string, string>()
    private url: string
    constructor(url: string, private comicId?: number, private comicPage?: number) {
      const config = useConfig()
      this.url = `${config["jm.proxy.resource"]}/${url}`
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
      const page = padStart(this.comicPage.toString(), 5)
      const data = md5(`${this.comicId}${page}`)
      const lastChar = data[data.length - 1]
      let key = lastChar.charCodeAt(0)
      if (268850 <= this.comicId && this.comicId <= 421925) key = key % 10
      else key = key % 8
      if (0 <= key && key <= 9) return key * 2 + 2
      else return 10
    }
    public async decryptImg() {
      if (!this.comicPage || !this.comicId) return this.url
      const img = await Jimp.read(this.url)
      const width = this.width = img.width
      const height = this.height = img.height

      // 创建目标图片（默认为透明黑色背景），与原图等大
      const out = new Jimp({
        width,
        height,
      })

      const segCount = this.getChunkNumber()
      if (Number.isNaN(segCount)) return this.url

      const segH = Math.floor(height / segCount) // 每段高度（向下取整，与 Python int 相当）
      const rem = height % segCount // 余数（加密后第一段多出来的像素）

      // 加密图片起始/结束位置（对应原 Python 里的变量）
      let ty0 = height - segH - rem
      let ty1 = height
      let dy = 0

      // 解密第一段：裁剪 (0, ty0) 高度 (ty1-ty0)，粘贴到 out (0, dy)
      {
        const h = ty1 - ty0
        if (h > 0) {
          const piece = img.clone().crop({ x: 0, y: ty0, w: width, h })
          out.blit({
            src: piece,
            x: 0,
            y: dy
          })
        }
      }

      // 增加余数部分到目标起始高度
      dy += segH + rem

      // 解密后续段
      for (let i = 1; i < segCount; i++) {
        ty0 -= segH
        ty1 -= segH
        const h = ty1 - ty0 // 应该等于 segH（最后一次亦然）
        if (h > 0) {
          const piece = img.clone().crop({ x: 0, y: ty0, w: width, h })
          out.blit({
            src: piece,
            x: 0,
            y: dy
          })
        }
        dy += segH
      }
      const mime = JimpMime.png
      const base64 = await out.getBase64(mime)
      const dataurl = `data:${mime};base64,${base64}`
      Image.loadedImage.set(this.url, dataurl)
      return dataurl
    }
  }
  export type Image_ = Image | string
}