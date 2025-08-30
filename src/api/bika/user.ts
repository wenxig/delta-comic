
import dayjs from 'dayjs'
import { _bikaImage } from './image'
import userIcon from '@/assets/images/userIcon.webp?url'
import type { Plugin } from '@/plugin/define'
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
  export class User implements RawUser, Plugin.Struct<RawUser> {
    public static is(v: any): v is User {
      return v instanceof User
    }
    public toJSON() {
      return this.$$raw
    }
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
      return 100 * this.level * (this.level + 1)
    }
    constructor(protected $$raw: RawUser) {
      this._id = $$raw._id
      this.gender = $$raw.gender
      this.name = $$raw.name
      this.verified = $$raw.verified
      this.exp = $$raw.exp
      this.level = $$raw.level
      this.characters = $$raw.characters
      this.role = $$raw.role
      this.avatar = $$raw.avatar
      this.title = $$raw.title
      this.slogan = $$raw.slogan
    }
  }
  export interface RawUserMe extends RawUser {
    birthday: string
    email: string
    created_at: string
    isPunched: boolean
  }
  export class UserMe extends User implements RawUserMe, Plugin.Struct<RawUserMe> {
    public birthday: string
    public email: string
    public isPunched: boolean
    public created_at: string
    public get $created_at() {
      return dayjs(this.created_at)
    }
    public override toJSON() {
      return this.$$raw
    }
    constructor(protected override $$raw: RawUserMe) {
      super($$raw)
      this.birthday = $$raw.birthday
      this.email = $$raw.email
      this.isPunched = $$raw.isPunched
      this.created_at = $$raw.created_at
    }
  }

  export interface RawKnight extends RawUser {
    comicsUploaded: number
  }
  export class Knight extends User implements RawKnight, Plugin.Struct<RawKnight> {
    public comicsUploaded: number
    public override toJSON() {
      return this.$$raw
    }
    constructor(public override $$raw: RawKnight) {
      super($$raw)
      this.comicsUploaded = $$raw.comicsUploaded
    }
  }
}