import dayjs from "dayjs"
import { _bikaUser } from "./user"

export namespace _bikaComment {
  export interface RawBaseComment {
    _id: string
    content: string
    _user?: _bikaUser.RawUserProfile
    totalComments: number
    isTop: boolean
    hide: boolean
    created_at: string
    likesCount: number
    commentsCount: number
    isLiked: boolean
  }
  export abstract class BaseComment implements RawBaseComment {
    public static isComment(v: unknown): v is BaseComment {
      return v instanceof BaseComment
    }
    public _id: string
    public content: string
    public _user?: _bikaUser.RawUserProfile
    public get $_user() {
      return this._user && new _bikaUser.UserProfile(this._user)
    }
    public totalComments: number
    public isTop: boolean
    public hide: boolean
    public created_at: string
    public get $created_at() {
      return dayjs(this.created_at)
    }
    public likesCount: number
    public commentsCount: number
    public isLiked: boolean
    constructor(v: RawBaseComment) {
      this._id = v._id
      this.content = v.content
      this._user = v._user
      this.totalComments = v.totalComments
      this.isTop = v.isTop
      this.hide = v.hide
      this.created_at = v.created_at
      this.likesCount = v.likesCount
      this.commentsCount = v.commentsCount
      this.isLiked = v.isLiked
    }
  }

  export interface RawComment extends RawBaseComment {
    _comic: string
  }
  export class Comment extends BaseComment implements RawComment {
    public static override isComment(v: unknown): v is Comment {
      return v instanceof Comment
    }
    public _comic: string
    constructor(v: RawComment) {
      super(v)
      this._comic = v._comic
    }
  }

  export interface RawMyComment extends RawBaseComment {
    _comic: {
      _id: string
      title: string
    }
  }
  export class MyComment extends BaseComment implements RawMyComment {
    public static override isComment(v: unknown): v is MyComment {
      return v instanceof MyComment
    }
    public _comic: {
      _id: string
      title: string
    }
    constructor(v: RawMyComment) {
      super(v)
      this._comic = v._comic
    }
  }

  export interface RawChildComment extends RawComment {
    _parent: string
  }
  export class ChildComment extends Comment implements RawChildComment {
    public static isChildComment(v: unknown): v is ChildComment {
      return v instanceof ChildComment
    }
    public _parent: string
    constructor(v: RawChildComment) {
      super(v)
      this._parent = v._parent
    }
  }
}