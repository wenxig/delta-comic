import type { Plugin } from "@/plugin/define"
import type { _jmComment } from "./comment"
import { _jmImage } from "./image"

export namespace _jmUser {
  export type Gender = "Male" | "Female"
  export interface RawBadge {
    content: string
    id: string
    name: string
  }
  export class Badge implements RawBadge, Plugin.Struct<RawBadge> {
    public content: string
    public get $content() {
      return new _jmImage.Image(this.content)
    }
    public id: string
    public name: string
    public toJSON() {
      return this.$$raw
    }
    constructor(protected $$raw: RawBadge) {
      this.content = $$raw.content
      this.id = $$raw.id
      this.name = $$raw.name
    }
  }

  export interface RawExpInfo {
    level_name: string
    level: number
    nextLevelExp: string
    exp: string
    expPercent: number
    uid: string
    badges: RawBadge[]
  }
  export class ExpInfo implements RawExpInfo, Plugin.Struct<RawExpInfo> {
    public level_name: string
    public level: number
    public nextLevelExp: string
    public get $nextLevelExp() {
      return Number(this.nextLevelExp)
    }
    public exp: string
    public get $exp() {
      return Number(this.exp)
    }
    public expPercent: number
    public uid: string
    public get $uid() {
      return Number(this.uid)
    }
    public badges: RawBadge[]
    public get $badges() {
      return this.badges.map(v => new Badge(v))
    }
    public toJSON() {
      return this.$$raw
    }
    constructor(protected $$raw: RawExpInfo) {
      this.level_name = $$raw.level_name
      this.level = $$raw.level
      this.nextLevelExp = $$raw.nextLevelExp
      this.exp = $$raw.exp
      this.expPercent = $$raw.expPercent
      this.uid = $$raw.uid
      this.badges = $$raw.badges
    }
  }

  export interface RawUserMe extends RawExpInfo {
    ad_free: boolean
    ad_free_before: string
    album_favorites: number
    album_favorites_max: number
    charge: string
    coin: number
    email: string
    emailverified: string
    fname: string
    gender: Gender
    invitation_qrcode: string
    invitation_url: string
    invited_cnt: string
    jar: string
    jwttoken: string
    message: string
    photo: string
    s: string
    username: string
  }
  export class UserMe extends ExpInfo implements RawUserMe, Plugin.Struct<RawUserMe> {
    public static is(v: any): v is UserMe {
      return v instanceof UserMe
    }
    public toCommonUser() {
      return new CommonUser(this)
    }
    public ad_free: boolean
    public ad_free_before: string
    public album_favorites: number
    public album_favorites_max: number
    public charge: string
    public coin: number
    public email: string
    public emailverified: string
    public fname: string
    public gender: Gender
    public invitation_qrcode: string
    public invitation_url: string
    public invited_cnt: string
    public jar: string
    public jwttoken: string
    public message: string
    public photo: string
    public get $photo() {
      return new _jmImage.Image(this.photo)
    }
    public s: string
    public username: string
    public override toJSON() {
      return this.$$raw
    }
    constructor(protected override $$raw: RawUserMe) {
      super($$raw)
      this.ad_free = $$raw.ad_free
      this.ad_free_before = $$raw.ad_free_before
      this.album_favorites = $$raw.album_favorites
      this.album_favorites_max = $$raw.album_favorites_max
      this.charge = $$raw.charge
      this.coin = $$raw.coin
      this.email = $$raw.email
      this.emailverified = $$raw.emailverified
      this.fname = $$raw.fname
      this.gender = $$raw.gender
      this.invitation_qrcode = $$raw.invitation_qrcode
      this.invitation_url = $$raw.invitation_url
      this.invited_cnt = $$raw.invited_cnt
      this.jar = $$raw.jar
      this.jwttoken = $$raw.jwttoken
      this.message = $$raw.message
      this.photo = $$raw.photo
      this.s = $$raw.s
      this.username = $$raw.username
    }
  }

  export class CommonUser<T extends _jmComment.Comment | UserMe> implements Plugin.Struct<ReturnType<T['toJSON']>> {
    public expInfo
    public username
    public nickname
    public gender
    public uid
    public avatar
    public toJSON() {
      return <ReturnType<T['toJSON']>>this.userLike.toJSON()
    }
    constructor(private userLike: T) {
      this.gender = userLike.gender
      this.username = userLike.username
      if (UserMe.is(userLike)) {
        this.expInfo = new ExpInfo(userLike)
        this.nickname = userLike.fname
        this.uid = userLike.$uid
      } else {
        this.expInfo = userLike.$expinfo
        this.nickname = userLike.nickname
        this.uid = userLike.$UID
      }
      this.avatar = new _jmImage.Image(`/media/users/${this.uid}.jpg`)
    }
  }
}



