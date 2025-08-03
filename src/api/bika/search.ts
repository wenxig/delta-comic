import { RawCommonComic, CommonComic } from "./comic"
import { Image, type RawImage } from "./image"

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

export interface RawCategories {
  title: string
  thumb: RawImage
  isWeb: boolean
  active: boolean
  link?: string
}
export class Categories implements RawCategories {
  public title: string
  public thumb: RawImage
  public get $thumb() {
    return new Image(this.thumb)
  }
  public isWeb: boolean
  public active: boolean
  public link?: string
  constructor(v: RawCategories) {
    this.title = v.title
    this.thumb = v.thumb
    this.isWeb = v.isWeb
    this.active = v.active
    this.link = v.link
  }
}
