import dayjs from "dayjs"
import { _bikaUser } from "./user"
import type { Plugin } from "@/plugin/define"

export namespace _bikaComment {
  export interface RawBaseComment {
    _id: string
    content: string
    _user?: _bikaUser.RawUserMe
    totalComments: number
    isTop: boolean
    hide: boolean
    created_at: string
    likesCount: number
    commentsCount: number
    isLiked: boolean
  }
  export abstract class BaseComment implements RawBaseComment, Plugin.Struct<RawBaseComment> {
    public toJSON() {
      return this.$$raw
    }
    public static isComment(v: unknown): v is BaseComment {
      return v instanceof BaseComment
    }
    public _id: string
    public content: string
    public _user?: _bikaUser.RawUserMe
    public get $_user() {
      return this._user && new _bikaUser.UserMe(this._user)
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
    constructor(protected $$raw: RawBaseComment) {
      this._id = $$raw._id
      this.content = $$raw.content
      this._user = $$raw._user
      this.totalComments = $$raw.totalComments
      this.isTop = $$raw.isTop
      this.hide = $$raw.hide
      this.created_at = $$raw.created_at
      this.likesCount = $$raw.likesCount
      this.commentsCount = $$raw.commentsCount
      this.isLiked = $$raw.isLiked
    }
  }

  export interface RawComment extends RawBaseComment {
    _comic: string
  }
  export class Comment extends BaseComment implements RawComment, Plugin.Struct<RawComment> {
    public override toJSON() {
      return this.$$raw
    }
    public static override isComment(v: unknown): v is Comment {
      return v instanceof Comment
    }
    public _comic: string
    constructor(protected override $$raw: RawComment) {
      super($$raw)
      this._comic = $$raw._comic
    }
  }

  export interface RawMyComment extends RawBaseComment {
    _comic: {
      _id: string
      title: string
    }
  }
  export class MyComment extends BaseComment implements RawMyComment, Plugin.Struct<RawMyComment> {
    public override toJSON() {
      return this.$$raw
    }
    public static override isComment(v: unknown): v is MyComment {
      return v instanceof MyComment
    }
    public _comic: {
      _id: string
      title: string
    }
    constructor(protected override $$raw: RawMyComment) {
      super($$raw)
      this._comic = $$raw._comic
    }
  }

  export interface RawChildComment extends RawComment {
    _parent: string
  }
  export class ChildComment extends Comment implements RawChildComment, Plugin.Struct<RawChildComment> {
    public override toJSON() {
      return this.$$raw
    }
    public static isChildComment(v: unknown): v is ChildComment {
      return v instanceof ChildComment
    }
    public _parent: string
    constructor(protected override $$raw: RawChildComment) {
      super($$raw)
      this._parent = $$raw._parent
    }
  }
}