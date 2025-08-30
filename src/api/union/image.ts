import type { Plugin } from "@/plugin/define"
import { bika } from "../bika"
import { jm } from "../jm"

export namespace _uniImage {
  export interface JSONImage {
    width: number
    height: number
    raw: bika.image.RawImage | jm.image.RawImage
    type: 'bika' | 'jm'
    _uni_image_: true
  }
  export class Image implements Plugin.Struct<JSONImage> {
    public static isJSON(v: any): v is JSONImage {
      return !!v._uni_image_
    }
    public width: number
    public height: number
    public toJSON() {
      return {
        width: this.width,
        height: this.height,
        raw: Image.isJSON(this.$$raw) ? this.$$raw.raw : this.$$raw.toJSON(),
        type: Image.isJSON(this.$$raw) ? this.$$raw.type : jm.image.Image.is(this.$$raw) ? 'jm' : 'bika',
        _uni_image_: true
      } as const
    }
    private raw: bika.image.RawImage | jm.image.RawImage | bika.image.Image | jm.image.Image
    constructor(public $$raw: JSONImage | bika.image.Image | jm.image.Image) {
      if (Image.isJSON($$raw)) this.raw = $$raw.raw
      else this.raw = $$raw
      this.width = $$raw.width
      this.height = $$raw.height
    }
    public async getUrl() {
      if (bika.image.Image.is(this.raw) || jm.image.Image.is(this.raw)) {
        return await this.raw.getUrl()
      } else {
        if (Image.isJSON(this.$$raw)) {
          if (this.$$raw.type == 'bika') {
            return (new bika.image.Image(<any>this.raw)).getUrl()
          } else {
            return await (new jm.image.Image(<any>this.raw)).getUrl()
          }
        }
      }
      throw new Error('unknown image type')
    }
  }
  export type Image_ = bika.image.Image | jm.image.Image | Image | string
}