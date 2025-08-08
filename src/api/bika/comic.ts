import { isFunction } from "lodash-es"
import dayjs from "dayjs"
import symbol from "@/symbol"
import { _bikaImage } from "./image"
import { _bikaUser } from "./user"

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
  export abstract class BaseComic implements RawBaseComic {
    public static isComic(v: unknown): v is BaseComic {
      return v instanceof BaseComic
    }
    public _id
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
    public toJSON() {
      const keys = <(keyof this)[]>Object.keys(this).map(v => {
        if (v.startsWith('__')) return v.substring(1)
        if (v.startsWith('_$')) return v.substring(2)
        return v
      })
      const obj: any = {}
      for (const key of keys) isFunction(this[key]) || (obj[key] = this[key])
      delete obj.picId
      return obj
    }
    constructor(v: RawBaseComic) {
      this._id = v._id
      this.title = v.title
      this.author = v.author
      this.totalViews = v.totalViews
      this.totalLikes = v.totalLikes
      this.finished = v.finished
      this.categories = v.categories
      this.thumb = v.thumb
      this.likesCount = v.likesCount
    }
  }

  export interface RawLessComic extends RawBaseComic {
    pagesCount: number
    epsCount: number
  }
  export class LessComic extends BaseComic implements RawLessComic {
    public pagesCount
    public epsCount
    constructor(v: RawLessComic) {
      super(v)
      this.pagesCount = v.pagesCount
      this.epsCount = v.epsCount
    }
    public static is(v: unknown): v is LessComic {
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
  export class CommonComic extends BaseComic implements RawCommonComic {
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
    constructor(v: RawCommonComic) {
      super(v)
      this.updated_at = v.updated_at
      this.description = v.description
      this.chineseTeam = v.chineseTeam
      this.created_at = v.created_at
      this.tags = v.tags
    }
    public static is(v: unknown): v is CommonComic {
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
  export class FullComic extends CommonComic implements RawFullComic {
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
    constructor(v: RawFullComic) {
      super(v)
      this._creator = v._creator
      this.pagesCount = v.pagesCount
      this.epsCount = v.epsCount
      this.allowDownload = v.allowDownload
      this.allowComment = v.allowComment
      this.totalComments = v.totalComments
      this.viewsCount = v.viewsCount
      this.commentsCount = v.commentsCount
      this.isFavourite = v.isFavourite
      this.isLiked = v.isLiked
    }
    public static override is(v: unknown): v is FullComic {
      return v instanceof FullComic
    }
  }


  export interface RawComicEp {
    _id: string
    title: string
    order: number
    updated_at: number
    id: string
  }
  export class ComicEp implements RawComicEp {
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