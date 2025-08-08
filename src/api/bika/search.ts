import type { Stream } from "@/utils/data"
import { _bikaComic } from "./comic"
import { _bikaImage } from "./image"
import type { _bikaUser } from "./user"

export namespace _bikaSearch {

  export interface RawCollection {
    comics: _bikaComic.RawCommonComic[]
    title: string
  }
  export class Collection implements RawCollection {
    public title: string
    public comics: _bikaComic.RawCommonComic[]
    public get $comics(): _bikaComic.CommonComic[] {
      return this.comics.map(v => new _bikaComic.CommonComic(v))
    }
    constructor(v: RawCollection) {
      this.title = v.title
      this.comics = v.comics
    }
  }

  export interface RawCategory {
    title: string
    thumb: _bikaImage.RawImage
    isWeb: boolean
    active: boolean
    link?: string
  }
  export class Category implements RawCategory {
    public title: string
    public thumb: _bikaImage.RawImage
    public get $thumb() {
      return new _bikaImage.Image(this.thumb)
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
    users: _bikaUser.Knight[],
    comics: _bikaComic.LessComic[][]
  }
  export type StreamType = Stream<_bikaComic.BaseComic>
}