import dayjs from "dayjs"
import { _jmImage } from "./image"
import symbol from "@/symbol"
import type { _jmSearch } from "./search"
import { isEmpty } from "lodash-es"
import { useConfig } from "@/config"
import { uni } from "../union"

export namespace _jmComic {
  export const spiltUsers = (userString = '') => userString.split(symbol.splitAuthorRegexp).filter(Boolean).map(v => v.trim()).filter(Boolean)

  export interface RawBaseComic {
    id: string
    name: string
    is_favorite: boolean
    liked: boolean
  }
  export abstract class BaseComic implements RawBaseComic {
    public id: string
    public author: string | string[] = []
    public get $id() {
      return Number(this.id)
    }
    public name: string
    public is_favorite: boolean
    public liked: boolean
    public get $thumb() {
      return new _jmImage.Image(`/media/albums/${this.$id}_3x4.jpg`, this.$id)
    }
    constructor(v: RawBaseComic) {
      this.id = v.id
      this.name = v.name
      this.is_favorite = v.is_favorite
      this.liked = v.liked
    }
    public static is(v: any): v is BaseComic {
      return v instanceof BaseComic
    }
    public toUniComic(){
      return new uni.comic.Comic<BaseComic>(this)
    }
  }

  export interface RawLessComic extends RawBaseComic {
    addtime: string
    images: string[]
    series: _jmSearch.Series[]
    series_id: string
    tags: string
  }
  export class LessComic extends BaseComic implements RawLessComic {
    public addtime: string
    public get $addtime() {
      return dayjs(this.addtime)
    }
    public images: string[]
    public get $images() {
      return this.images.map(img => new _jmImage.Image(img, this.$id))
    }
    public series: _jmSearch.Series[]
    public series_id: string
    public tags: string
    public get $tags() {
      return this.tags.split(' ').map(v => !isEmpty(v))
    }
    constructor(v: RawLessComic) {
      super(v)
      this.addtime = v.addtime
      this.images = v.images
      this.series = v.series
      this.series_id = v.series_id
      this.tags = v.tags
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
  export class CommonComic extends BaseComic implements RawCommonComic {
    public override author: string
    public get $author() {
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
    constructor(v: RawCommonComic) {
      super(v)
      this.author = v.author
      this.description = v.description
      this.image = v.image
      this.category = v.category
      this.category_sub = v.category_sub
      this.update_at = v.update_at
    }
    public static override is(v: any): v is CommonComic {
      return v instanceof CommonComic
    }
  }

  export interface RawRecommendComic {
    id: string,
    author: string,
    name: string,
    image: string
  }
  export class RecommendComic extends BaseComic implements RawRecommendComic {
    public override author: string
    public get $author() {
      return this.author.split(' ')
    }
    public image: string
    public get $image() {
      return new _jmImage.Image(this.image, this.$id)
    }
    constructor(v: RawRecommendComic) {
      super({
        ...v,
        is_favorite: false,
        liked: false
      })
      this.id = v.id
      this.author = v.author
      this.name = v.name
      this.image = v.image
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
    series: _jmSearch.Series[]
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
  export class FullComic extends BaseComic implements RawFullComic {
    public images: string[]
    public get $images() {
      return this.images.map(img => new _jmImage.Image(img, this.$id))
    }
    public addtime: string
    public get $addtime() {
      return dayjs(this.addtime)
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
    public series: _jmSearch.Series[]
    public series_id: string
    public comment_total: string
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

    constructor(v: RawFullComic) {
      super(v)
      this.images = v.images
      this.addtime = v.addtime
      this.description = v.description
      this.total_views = v.total_views
      this.likes = v.likes
      this.series = v.series
      this.series_id = v.series_id
      this.comment_total = v.comment_total
      this.author = v.author
      this.tags = v.tags
      this.works = v.works
      this.actors = v.actors
      this.related_list = v.related_list
      this.is_aids = v.is_aids
      this.price = v.price
      this.purchased = v.purchased
    }
    public static override is(v: any): v is FullComic {
      return v instanceof FullComic
    }
  }
}