import { bika } from "../bika"
import type { jm } from "../jm"

export namespace _uniImage {
  export class Image {
    public width: number
    public height: number
    constructor(private val: bika.image.Image | jm.image.Image) {
      this.width = val.width
      this.height = val.height
    }
    public async getUrl() {
      if (bika.image.Image.is(this.val)) {
        return this.val.getUrl()
      }
      return await this.val.getUrl()
    }
  }
  export type Image_ = bika.image.Image | jm.image.Image | Image | string
}