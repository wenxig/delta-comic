import dayjs from "dayjs"
import { _jmImage } from "./image"
import symbol from "@/symbol"
import type { _jmSearch } from "./search"
import { isEmpty, isString } from "lodash-es"
import { uni } from "../union"
import type { Plugin } from "@/plugin/define"

export namespace _jmComic {
  export const spiltUsers = (userString = '') => userString.split(symbol.splitAuthorRegexp).filter(Boolean).map(v => v.trim()).filter(Boolean)

  export interface RawSeries {
    id: string
    name: string
    sort: string
  }
  export class Series implements RawSeries, Plugin.Struct<RawSeries> {
    public toJSON() {
      return this.$$raw
    }
    public id: string
    public get $id() {
      return Number(this.id)
    }
    public name: string
    public sort: string
    public get $sort() {
      return Number(this.sort)
    }
    constructor(protected $$raw: RawSeries) {
      this.id = $$raw.id
      this.name = $$raw.name
      this.sort = $$raw.sort
    }
    public static is(v: any): v is Series {
      return v instanceof Series
    }
    public toUniEp() {
      return new uni.comic.Ep(this)
    }
  }

  export interface RawBaseComic {
    id: string
    name: string
    is_favorite: boolean
    liked: boolean
  }
  export abstract class BaseComic implements RawBaseComic, Plugin.Struct<RawBaseComic> {
    public toJSON() {
      return this.$$raw
    }
    public id: string
    public author: string | string[] = []
    public get $author() {
      return (isString(this.author) ? spiltUsers(this.author) : this.author).filter(Boolean)
    }
    public get $id() {
      return Number(this.id)
    }
    public name: string
    public is_favorite: boolean
    public liked: boolean
    public get $thumb() {
      return new _jmImage.Image(`/media/albums/${this.$id}_3x4.jpg`, this.$id)
    }
    constructor(protected $$raw: RawBaseComic) {
      this.id = $$raw.id
      this.name = $$raw.name
      this.is_favorite = $$raw.is_favorite
      this.liked = $$raw.liked
    }
    public static is(v: any): v is BaseComic {
      return v instanceof BaseComic
    }
    public toUniComic() {
      return new uni.comic.Comic<BaseComic>(this)
    }
    public get $isAi() {
      return ((/(^|[\(（\[\s【])ai[】\)）\]\s]?/ig)).test(this.name) || this.$author.some(author => ((/(^|[\(（\[\s【])ai[】\)）\]\s]?/ig)).test(author))
    }
  }

  export interface RawLessComic extends RawBaseComic {
    addtime: string
    images: string[]
    series: RawSeries[]
    series_id: string
    tags: string
  }
  export class LessComic extends BaseComic implements RawLessComic, Plugin.Struct<RawLessComic> {
    public override toJSON() {
      return this.$$raw
    }
    public addtime: string
    public get $addtime() {
      return dayjs(Number(this.addtime))
    }
    public images: string[]
    public get $images() {
      return this.images.map(img => new _jmImage.Image(img, this.$id))
    }
    public series: RawSeries[]
    public get $series() {
      return this.series.map(item => new Series(item))
    }
    public series_id: string
    public get $series_id() {
      return Number(this.series_id)
    }
    public tags: string
    public get $tags() {
      return this.tags.split(' ').map(v => !isEmpty(v))
    }
    constructor(protected override $$raw: RawLessComic) {
      super($$raw)
      this.addtime = $$raw.addtime
      this.images = $$raw.images
      this.series = $$raw.series
      this.series_id = $$raw.series_id
      this.tags = $$raw.tags
    }
    public static override is(v: any): v is LessComic {
      return v instanceof LessComic
    }
  }

  export interface RawCommonComic extends RawBaseComic {
    author: string
    description?: string
    image: string
    category: _jmSearch.Category
    category_sub: _jmSearch.Category
    update_at?: number
  }
  export class CommonComic extends BaseComic implements RawCommonComic, Plugin.Struct<RawCommonComic> {
    public override toJSON() {
      return this.$$raw
    }
    public override author: string
    public override get $author() {
      return this.author.split(' ')
    }
    public description?: string
    public image: string
    public get $image() {
      return new _jmImage.Image(this.image, this.$id)
    }
    public category: _jmSearch.Category
    public category_sub: _jmSearch.Category
    public update_at?: number
    public get $update_at() {
      if (!this.update_at) return
      return dayjs(this.update_at)
    }
    constructor(protected override $$raw: RawCommonComic) {
      super($$raw)
      this.author = $$raw.author
      this.description = $$raw.description
      this.image = $$raw.image
      this.category = $$raw.category
      this.category_sub = $$raw.category_sub
      this.update_at = $$raw.update_at
    }
    public static override is(v: any): v is CommonComic {
      return v instanceof CommonComic
    }
  }

  export interface RawRecommendComic {
    id: string,
    author: string,
    name: string,
    image: string,

    // fake
    is_favorite: boolean
    liked: boolean
  }
  export class RecommendComic extends BaseComic implements RawRecommendComic, Plugin.Struct<RawRecommendComic> {
    public override toJSON() {
      return {
        ...this.$$raw,
        is_favorite: this.is_favorite,
        liked: this.liked
      }
    }
    public override author: string
    public override get $author() {
      return this.author.split(' ')
    }
    public image: string
    public get $image() {
      return new _jmImage.Image(this.image, this.$id)
    }
    constructor(protected override $$raw: RawRecommendComic) {
      super({
        ...$$raw,
        is_favorite: false,
        liked: false
      })
      this.id = $$raw.id
      this.author = $$raw.author
      this.name = $$raw.name
      this.image = $$raw.image
    }
    public static override is(v: any): v is RecommendComic {
      return v instanceof RecommendComic
    }
  }

  export interface RawFullComic extends RawBaseComic {
    images: string[]
    addtime: string
    description: string
    total_views: string
    series: RawSeries[]
    series_id: string
    comment_total: string
    author: string[]
    tags: string[]
    works: string[]
    actors: string[]
    related_list: RawRecommendComic[]
    liked: boolean
    is_aids: boolean
    price: string
    purchased: string
    likes: string
  }
  export class FullComic extends BaseComic implements RawFullComic, Plugin.Struct<RawFullComic> {
    public override toJSON() {
      return this.$$raw
    }
    public images: string[]
    public get $images() {
      return this.images.map(img => new _jmImage.Image(img, this.$id))
    }
    public addtime: string
    public get $addtime() {
      return dayjs(Number(this.addtime))
    }
    public description: string
    public total_views: string
    public get $total_views() {
      return Number(this.total_views)
    }
    public likes: string
    public get $likes() {
      return Number(this.likes)
    }
    public series: RawSeries[]
    public get $series() {
      return this.series.map(item => new Series(item))
    }
    public series_id: string
    public get $series_id() {
      return Number(this.series_id)
    }
    public comment_total: string
    public get $comment_total() {
      return Number(this.comment_total)
    }
    public override author: string[]
    public tags: string[]
    public works: string[]
    public actors: string[]
    public related_list: RawRecommendComic[]
    public get $related_list() {
      return this.related_list.map(item => new RecommendComic(item))
    }
    public is_aids: boolean
    public price: string
    public purchased: string

    constructor(protected override $$raw: RawFullComic) {
      super($$raw)
      this.images = $$raw.images
      this.addtime = $$raw.addtime
      this.description = $$raw.description
      this.total_views = $$raw.total_views
      this.likes = $$raw.likes
      this.series = $$raw.series
      this.series_id = $$raw.series_id
      this.comment_total = $$raw.comment_total
      this.author = $$raw.author
      this.tags = $$raw.tags
      this.works = $$raw.works
      this.actors = $$raw.actors
      this.related_list = $$raw.related_list
      this.is_aids = $$raw.is_aids
      this.price = $$raw.price
      this.purchased = $$raw.purchased
    }
    public static override is(v: any): v is FullComic {
      return v instanceof FullComic
    }
  }
}