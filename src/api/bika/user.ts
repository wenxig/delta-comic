
import dayjs from 'dayjs'
import { _bikaImage } from './image'
import userIcon from '@/assets/images/userIcon.webp?url'
export namespace _bikaUser {
  export type Gender = 'f' | 'm' | 'bot'
  export interface RawUser {
    _id: string
    gender: Gender
    name: string
    verified: boolean
    exp: number
    level: number
    characters: string[]
    role?: string
    title: string
    slogan: string
    avatar?: _bikaImage.RawImage
  }
  export class User implements RawUser {
    public avatar?: _bikaImage.RawImage
    public get $avatar() {
      return this.avatar ? new _bikaImage.Image(this.avatar) : userIcon
    }
    public _id: string
    public gender: Gender
    public name: string
    public verified: boolean
    public exp: number
    public level: number
    public characters: string[]
    public role?: string
    public title: string
    public slogan: string
    public get $needExp() {
      return (((this.level + 1) * 2 - 1) ** 2 - 1) * 25 // 要知道我翻了20分钟bk的app(2.3)源码
    }
    constructor(v: RawUser) {
      this._id = v._id
      this.gender = v.gender
      this.name = v.name
      this.verified = v.verified
      this.exp = v.exp
      this.level = v.level
      this.characters = v.characters
      this.role = v.role
      this.avatar = v.avatar
      this.title = v.title
      this.slogan = v.slogan
    }
  }
  export interface RawUserMe extends RawUser {
    birthday: string
    email: string
    created_at: string
    isPunched: boolean
  }
  export class UserMe extends User implements RawUserMe {
    public birthday: string
    public email: string
    public isPunched: boolean
    public created_at: string
    public get $created_at() {
      return dayjs(this.created_at)
    }
    constructor(v: RawUserMe) {
      super(v)
      this.birthday = v.birthday
      this.email = v.email
      this.isPunched = v.isPunched
      this.created_at = v.created_at
    }
  }

  export interface RawKnight extends RawUser {
    comicsUploaded: number
  }
  export class Knight extends User {
    public comicsUploaded: number
    constructor(v: RawKnight) {
      super(v)
      this.comicsUploaded = v.comicsUploaded
    }
  }
}