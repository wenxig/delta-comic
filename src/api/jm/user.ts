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

  export interface RawUserMe {
    ad_free: boolean
    ad_free_before: string
    album_favorites: number
    album_favorites_max: number
    badges: RawBadge[]
    charge: string
    coin: number
    email: string
    emailverified: string
    exp: string
    expPercent: number
    fname: string
    gender: Gender
    invitation_qrcode: string
    invitation_url: string
    invited_cnt: string
    jar: string
    token: string
    level: number
    level_name: string
    message: string
    nextLevelExp: number
    photo: string
    s: string
    uid: string
    username: string
  }
  export class UserMe implements RawUserMe {
    public ad_free: boolean
    public ad_free_before: string
    public album_favorites: number
    public album_favorites_max: number
    public badges: RawBadge[]
    public charge: string
    public coin: number
    public email: string
    public emailverified: string
    public exp: string
    public expPercent: number
    public fname: string
    public gender: Gender
    public invitation_qrcode: string
    public invitation_url: string
    public invited_cnt: string
    public jar: string
    public token: string
    public level: number
    public level_name: string
    public message: string
    public nextLevelExp: number
    public photo: string
    public get $photo() {
      return new _jmImage.Image(this.photo)
    }
    public s: string
    public uid: string
    public username: string
    constructor(v: RawUserMe) {
      this.ad_free = v.ad_free
      this.ad_free_before = v.ad_free_before
      this.album_favorites = v.album_favorites
      this.album_favorites_max = v.album_favorites_max
      this.badges = v.badges
      this.charge = v.charge
      this.coin = v.coin
      this.email = v.email
      this.emailverified = v.emailverified
      this.exp = v.exp
      this.expPercent = v.expPercent
      this.fname = v.fname
      this.gender = v.gender
      this.invitation_qrcode = v.invitation_qrcode
      this.invitation_url = v.invitation_url
      this.invited_cnt = v.invited_cnt
      this.jar = v.jar
      this.token = v.token
      this.level = v.level
      this.level_name = v.level_name
      this.message = v.message
      this.nextLevelExp = v.nextLevelExp
      this.photo = v.photo
      this.s = v.s
      this.uid = v.uid
      this.username = v.username
    }
  }
}