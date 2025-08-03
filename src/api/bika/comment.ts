import dayjs from "dayjs"
import { type RawUserProfile, UserProfile } from "./user"

export interface RawComment {
  _id: string
  content: string
  _user: RawUserProfile
  _comic: string
  totalComments: number
  isTop: boolean
  hide: boolean
  created_at: string
  likesCount: number
  commentsCount: number
  isLiked: boolean
}
export class Comment implements RawComment {
  public static isComment(v: unknown): v is Comment {
    return v instanceof Comment
  }
  public _id: string
  public content: string
  public _user: RawUserProfile
  public get $_user() {
    return new UserProfile(this._user)
  }
  public _comic: string
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
  constructor(v: RawComment) {
    this._id = v._id
    this.content = v.content
    this._user = v._user
    this._comic = v._comic
    this.totalComments = v.totalComments
    this.isTop = v.isTop
    this.hide = v.hide
    this.created_at = v.created_at
    this.likesCount = v.likesCount
    this.commentsCount = v.commentsCount
    this.isLiked = v.isLiked
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