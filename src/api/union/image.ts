import { bika } from "../bika"
import type { jm } from "../jm"

export namespace _uniImage {
  export class Image {
    public width: number
    public height: number
    constructor(public raw: bika.image.Image | jm.image.Image) {
      this.width = raw.width
      this.height = raw.height
    }
    public async getUrl() {
      if (bika.image.Image.is(this.raw)) {
        return this.raw.getUrl()
      }
      return await this.raw.getUrl()
    }
  }
  export type Image_ = bika.image.Image | jm.image.Image | Image | string
}