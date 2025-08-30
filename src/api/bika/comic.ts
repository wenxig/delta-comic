import dayjs from "dayjs"
import symbol from "@/symbol"
import { _bikaImage } from "./image"
import { _bikaUser } from "./user"
import { uni } from "../union"
import type { Plugin } from "@/plugin/define"

export namespace _bikaComic {
  export const spiltUsers = (userString = '') => userString.split(symbol.splitAuthorRegexp).filter(Boolean).map(v => v.trim()).filter(Boolean)

  export interface RawBaseComic {
    _id: string
    title: string
    author: string
    totalViews: number
    totalLikes: number
    finished: boolean
    categories: string[]
    thumb: _bikaImage.RawImage
    likesCount: number
  }
  export abstract class BaseComic implements RawBaseComic, Plugin.Struct<RawBaseComic> {
    public toJSON() {
      return this.$$raw
    }
    public static is(v: unknown): v is BaseComic {
      return v instanceof BaseComic
    }
    public _id
    public get id() {
      return this._id
    }
    public title
    public author
    public get $author() {
      return spiltUsers(this.author)
    }
    public totalViews
    public totalLikes
    public finished
    public categories
    public likesCount
    public thumb
    public get $thumb() {
      return new _bikaImage.Image(this.thumb)
    }
    constructor(protected $$raw: RawBaseComic) {
      this._id = $$raw._id
      this.title = $$raw.title
      this.author = $$raw.author
      this.totalViews = $$raw.totalViews
      this.totalLikes = $$raw.totalLikes
      this.finished = $$raw.finished
      this.categories = $$raw.categories
      this.thumb = $$raw.thumb
      this.likesCount = $$raw.likesCount
    }
    public toUniComic() {
      return new uni.comic.Comic<BaseComic>(this)
    }
    public get $isAi() {
      return (/(^|[\(（\[\s【])ai[】\)）\]\s]?/ig).test(this.title) || this.$author.some(author => ((/(^|[\(（\[\s【])ai[】\)）\]\s]?/ig)).test(author))
    }
  }

  export interface RawLessComic extends RawBaseComic {
    pagesCount: number
    epsCount: number
  }
  export class LessComic extends BaseComic implements RawLessComic, Plugin.Struct<RawLessComic> {
    public override toJSON() {
      return this.$$raw
    }
    public pagesCount
    public epsCount
    constructor(protected override $$raw: RawLessComic) {
      super($$raw)
      this.pagesCount = $$raw.pagesCount
      this.epsCount = $$raw.epsCount
    }
    public static override is(v: unknown): v is LessComic {
      return v instanceof LessComic
    }
  };

  export interface RawCommonComic extends RawBaseComic {
    updated_at: string
    description: string
    chineseTeam: string
    created_at: string
    tags: string[]
  }
  export class CommonComic extends BaseComic implements RawCommonComic, Plugin.Struct<RawCommonComic> {
    public updated_at
    public get updated_time() {
      return new Date(this.updated_at)
    }
    public description
    public chineseTeam
    public get $chineseTeam() {
      return spiltUsers(this.chineseTeam)
    }
    public created_at
    public get $created_at() {
      return dayjs(this.created_at)
    }
    public tags
    public override toJSON() {
      return this.$$raw
    }
    constructor(protected override $$raw: RawCommonComic) {
      super($$raw)
      this.updated_at = $$raw.updated_at
      this.description = $$raw.description
      this.chineseTeam = $$raw.chineseTeam
      this.created_at = $$raw.created_at
      this.tags = $$raw.tags
    }
    public static override is(v: unknown): v is CommonComic {
      return v instanceof CommonComic
    }
  }

  export interface RawFullComic extends RawBaseComic {
    _creator: _bikaUser.RawUser
    description: string
    chineseTeam: string
    tags: string[]
    pagesCount: number
    epsCount: number
    updated_at: string
    created_at: string
    allowDownload: boolean
    allowComment: boolean
    totalComments: number
    viewsCount: number
    commentsCount: number
    isFavourite: boolean
    isLiked: boolean
  }
  export class FullComic extends CommonComic implements RawFullComic, Plugin.Struct<RawFullComic> {
    public override toJSON() {
      return this.$$raw
    }
    public static override is(v: unknown): v is FullComic {
      return v instanceof FullComic
    }
    public _creator
    public get $_creator() {
      return new _bikaUser.User(this._creator)
    }
    public pagesCount
    public epsCount
    public allowDownload
    public allowComment
    public totalComments
    public viewsCount
    public commentsCount
    public isFavourite
    public isLiked
    constructor(protected override $$raw: RawFullComic) {
      super($$raw)
      this._creator = $$raw._creator
      this.pagesCount = $$raw.pagesCount
      this.epsCount = $$raw.epsCount
      this.allowDownload = $$raw.allowDownload
      this.allowComment = $$raw.allowComment
      this.totalComments = $$raw.totalComments
      this.viewsCount = $$raw.viewsCount
      this.commentsCount = $$raw.commentsCount
      this.isFavourite = $$raw.isFavourite
      this.isLiked = $$raw.isLiked
    }
  }


  export interface RawComicEp {
    _id: string
    title: string
    order: number
    updated_at: number
    id: string
  }
  export class Ep implements RawComicEp {
    public _id: string
    public title: string
    public order: number
    public updated_at: number
    public get $updated_at() {
      return dayjs(this.updated_at)
    }
    public id!: string
    constructor(v: RawComicEp) {
      this._id = v._id
      this.title = v.title
      this.order = v.order
      this.updated_at = v.updated_at
      this.id = v.id
    }
    public static is(v: unknown): v is Ep {
      return v instanceof Ep
    }
    public toUniEp() {
      return new uni.comic.Ep(this)
    }
  }

  export interface RawPage {
    id: string
    media: _bikaImage.RawImage
    _id: string
  }
  export class Page implements RawPage {
    public id: string
    public media: _bikaImage.RawImage
    public get $media() {
      return new _bikaImage.Image(this.media)
    }
    public _id: string
    constructor(v: RawPage) {
      this.id = v.id
      this.media = v.media
      this._id = v._id
    }
  }
}