import { bika } from "../bika"
import { jm } from "../jm"

export namespace _uniImage {
  export class Image {
    public width: number
    public height: number
    constructor(protected $$raw: bika.image.Image | jm.image.Image) {
      this.width = $$raw.width
      this.height = $$raw.height
    }
    public async getUrl() {
      return await this.$$raw.getUrl()
    }
    public toString(){
      console.log(this.$$raw, this.$$raw.toString())
      return this.$$raw.toString()
    }
  }
  export type Image_ = bika.image.Image | jm.image.Image | Image | string
}