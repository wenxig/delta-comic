import { useConfig } from "@/config"
export interface RawImage {
  originalName: string
  path: string
  fileServer: string
}
export class Image {
  public originalName!: string
  public path!: string
  public fileServer!: string
  constructor(v: RawImage) {
    this.originalName = v.originalName
    this.path = v.path
    this.fileServer = v.fileServer
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
