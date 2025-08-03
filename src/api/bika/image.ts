import { useConfig } from "@/config"
export interface RawImage {
  originalName: string
  path: string
  fileServer: string
}
export class Image {
  public static loadedImage = new Map<string, Image>()
  public originalName!: string
  public path!: string
  public fileServer!: string
  public native: HTMLImageElement
  public width = 0
  public height = 0
  constructor(v: RawImage) {
    this.originalName = v.originalName
    this.path = v.path
    this.fileServer = v.fileServer
    const catchValue = Image.loadedImage.get(this.getUrl())
    if (catchValue) {
      this.native = catchValue.native
      this.width = this.native.width
      this.height = this.native.height
    } else {
      this.native = new HTMLImageElement()
      this.native.src = this.getUrl()
    }
    this.native.onload = () => {
      this.width = this.native.width
      this.height = this.native.height
    }
  }
  public toString() {
    return this.getUrl()
  }
  public getUrl() {
    const config = useConfig()
    if (this.fileServer == 'local') return new URL(`../../assets/images/${this.path}`, import.meta.url).href
    return new URL(`${config['bika.proxy.image']}/${this.path}`).href
  }
}
export type Image_ = Image | string
