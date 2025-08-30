import type { Stream } from "@/utils/data"
import { _bikaComic } from "./comic"
import { _bikaImage } from "./image"
import type { _bikaUser } from "./user"
import type { Plugin } from "@/plugin/define"

export namespace _bikaSearch {

  export interface RawCollection {
    comics: _bikaComic.RawCommonComic[]
    title: string
  }
  export class Collection implements RawCollection, Plugin.Struct<RawCollection> {
    public toJSON() {
      return this.$$raw
    }
    public title: string
    public comics: _bikaComic.RawCommonComic[]
    public get $comics(): _bikaComic.CommonComic[] {
      return this.comics.map(v => new _bikaComic.CommonComic(v))
    }
    constructor(protected $$raw: RawCollection) {
      this.title = $$raw.title
      this.comics = $$raw.comics
    }
  }

  export interface RawCategory {
    title: string
    thumb: _bikaImage.RawImage
    isWeb: boolean
    active: boolean
    link?: string
  }
  export class Category implements RawCategory, Plugin.Struct<RawCategory> {
    public toJSON() {
      return this.$$raw
    }
    public title: string
    public thumb: _bikaImage.RawImage
    public get $thumb() {
      return new _bikaImage.Image(this.thumb)
    }
    public isWeb: boolean
    public active: boolean
    public link?: string
    constructor(protected $$raw: RawCategory) {
      this.title = $$raw.title
      this.thumb = $$raw.thumb
      this.isWeb = $$raw.isWeb
      this.active = $$raw.active
      this.link = $$raw.link
    }
  }


  export interface Levelboard {
    users: _bikaUser.Knight[],
    comics: _bikaComic.LessComic[][]
  }
  export type StreamType = Stream<_bikaComic.BaseComic>
}