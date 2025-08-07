import type { Stream } from "@/utils/data"
import { RawCommonComic, CommonComic, type LessComic, type BaseComic } from "./comic"
import { Image, type RawImage } from "./image"
import type { Knight } from "./user"

export interface RawCollection {
  comics: RawCommonComic[]
  title: string
}
export class Collection implements RawCollection {
  public title: string
  public comics: RawCommonComic[]
  public get $comics(): CommonComic[] {
    return this.comics.map(v => new CommonComic(v))
  }
  constructor(v: RawCollection) {
    this.title = v.title
    this.comics = v.comics
  }
}

export interface RawCategory {
  title: string
  thumb: RawImage
  isWeb: boolean
  active: boolean
  link?: string
}
export class Category implements RawCategory {
  public title: string
  public thumb: RawImage
  public get $thumb() {
    return new Image(this.thumb)
  }
  public isWeb: boolean
  public active: boolean
  public link?: string
  constructor(v: RawCategory) {
    this.title = v.title
    this.thumb = v.thumb
    this.isWeb = v.isWeb
    this.active = v.active
    this.link = v.link
  }
}


export interface Levelboard {
  users: Knight[],
  comics: LessComic[][]
}
export type SearchStreamType = Stream<BaseComic>
