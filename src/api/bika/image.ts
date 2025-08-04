import { useConfig } from "@/config"
export interface RawImage {
  originalName: string
  path: string
  fileServer: string
}
class _Image {
  public static loadedImage = new Map<string, _Image>()
  public originalName!: string
  public path!: string
  public fileServer!: string
  public width
  public height
  constructor(v: RawImage) {
    this.originalName = v.originalName
    this.path = v.path
    this.fileServer = v.fileServer
    // tobeimg/V61BoT9SkdYYl9ygwQ7O1kc71KGV5k4Opngem-Kt5x8/rs:fill:300:400:0/g:sm/aHR0cHM6Ly9zdG9yYWdlMS5waWNhY29taWMuY29tL3N0YXRpYy9hYzAzMDRlOC0wZWMxLTQwOGQtOTczOS0yNzY4ODJiOGNlMDIuanBn.jpg
    const [width, height] = (this.path.match(/(?<=rs:fill:)\d+:\d+/g)?.[0] ?? '300:400').split(':')
    this.width = Number(width)
    this.height = Number(height)
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
export {
  _Image as Image
}
export type Image_ = _Image | string
