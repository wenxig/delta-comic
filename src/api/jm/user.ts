import { _jmImage } from "./image"

export namespace _jmUser {
  export type Gender = "Male" | "Female"
  export interface RawBadge {
    content: string
    id: string
    name: string
  }
  export class Badge implements RawBadge {
    public content: string
    public id: string
    public name: string
    constructor(v: RawBadge) {
      this.content = v.content
      this.id = v.id
      this.name = v.name
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
  export class ExpInfo implements RawExpInfo {
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
    constructor(v: RawExpInfo) {
      this.level_name = v.level_name
      this.level = v.level
      this.nextLevelExp = v.nextLevelExp
      this.exp = v.exp
      this.expPercent = v.expPercent
      this.uid = v.uid
      this.badges = v.badges
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
    token: string
    message: string
    photo: string
    s: string
    username: string
  }
  export class UserMe extends ExpInfo implements RawUserMe {
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
    public token: string
    public message: string
    public photo: string
    public get $photo() {
      return new _jmImage.Image(this.photo)
    }
    public s: string
    public username: string
    constructor(v: RawUserMe) {
      super(v)
      this.ad_free = v.ad_free
      this.ad_free_before = v.ad_free_before
      this.album_favorites = v.album_favorites
      this.album_favorites_max = v.album_favorites_max
      this.charge = v.charge
      this.coin = v.coin
      this.email = v.email
      this.emailverified = v.emailverified
      this.fname = v.fname
      this.gender = v.gender
      this.invitation_qrcode = v.invitation_qrcode
      this.invitation_url = v.invitation_url
      this.invited_cnt = v.invited_cnt
      this.jar = v.jar
      this.token = v.token
      this.message = v.message
      this.photo = v.photo
      this.s = v.s
      this.username = v.username
    }
  }
}