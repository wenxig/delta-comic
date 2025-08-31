import { isArray } from "lodash-es"
import { bika } from "../bika"
import { jm } from "../jm"
import { _uniImage } from "./image"

export namespace _uniComic {
  export class Comic<T extends (Tb | Comic<any>) = any, Tb extends bika.comic.BaseComic | jm.comic.BaseComic = bika.comic.BaseComic | jm.comic.BaseComic> {
    public static is<U extends bika.comic.BaseComic | jm.comic.BaseComic>(value: unknown): value is Comic<U> {
      return value instanceof this
    }
    public raw: Tb
    public get $raw(): Tb {
      return Comic.is(this.raw) ? <Tb>this.raw.$raw : this.raw
    }
    public cover: _uniImage.Image
    public title: string
    public id: string
    public categories: string[]
    public author: string[]
    public viewNumber?: number
    public likeNumber?: number
    public commentNumber?: number
    public isLiked?: boolean
    public isFavourite?: boolean
    constructor(v: T) {
      if (bika.comic.BaseComic.is(v)) {
        this.raw = <Tb>v
        this.cover = new _uniImage.Image(v.$thumb)
        this.title = v.title
        this.id = v._id
        this.categories = v.categories
        this.author = v.$author
        this.viewNumber = v.totalViews
        this.likeNumber = v.totalLikes
        if (bika.comic.FullComic.is(v)) {
          this.commentNumber = v.totalComments
          this.isLiked = v.isLiked
          this.isFavourite = v.isFavourite
        }
      } else if (jm.comic.BaseComic.is(v)) {
        this.raw = <Tb>v
        this.cover = new _uniImage.Image(v.$thumb)
        this.title = v.name
        this.id = v.$id.toString()
        this.categories = []
        this.author = []
        this.author = isArray(v.author) ? v.author : v.author.split(' ')
        if (jm.comic.CommonComic.is(v)) this.categories = <string[]>[v.category.title, v.category_sub.title].filter(Boolean)
        if (jm.comic.FullComic.is(v)) {
          this.viewNumber = v.$total_views
          this.likeNumber = v.$likes
          this.commentNumber = v.$comment_total
          this.isLiked = v.liked
          this.isFavourite = v.is_favorite
        }
      } else {
        this.raw = <Tb>v.$raw
        this.cover = v.cover
        this.title = v.title
        this.id = v.id
        this.categories = v.categories
        this.author = v.author
        this.viewNumber = v.viewNumber
        this.likeNumber = v.likeNumber
      }
    }
    public toUniComic(): _uniComic.Comic<T> {
      return this
    }
    public get $isAi() {
      return (/(^|[\(（\[\s【])ai[】\)）\]\s]?/ig).test(this.title) || this.author.some(author => (/(^|[\(（\[\s【])ai[】\)）\]\s]?/ig).test(author))
    }
  }

  export class Ep<T extends bika.comic.Ep | jm.comic.Series = bika.comic.Ep | jm.comic.Series> {
    public id: string
    public order: number
    public title: string
    public raw: T
    constructor(v: T) {
      this.id = v.id
      this.raw = v
      if (bika.comic.Ep.is(v)) {
        this.order = v.order
        this.title = v.title
      } else {
        this.order = Number(v.id)
        this.title = v.name
      }
    }
  }
}