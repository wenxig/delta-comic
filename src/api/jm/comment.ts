import dayjs from "dayjs"
import { _jmUser } from "./user"
import { _jmImage } from "./image"
import DOMPurify from 'dompurify'
import type { Plugin } from "@/plugin/define"
export namespace _jmComment {
  export interface RawComment {
    AID: string
    BID: string
    CID: string
    UID: string
    username: string
    nickname: string
    likes: string
    gender: _jmUser.Gender
    update_at: string
    addtime: string
    parent_CID: string
    expinfo: _jmUser.RawExpInfo
    name: string
    content: string
    photo: string
    spoiler: string
  }
  export class Comment implements RawComment, Plugin.Struct<RawComment> {
    public AID: string
    public get $AID() {
      return Number(this.AID)
    }
    public BID: string
    public get $BID() {
      return Number(this.BID)
    }
    public CID: string
    public get $CID() {
      return Number(this.CID)
    }
    public UID: string
    public get $UID() {
      return Number(this.UID)
    }
    public username: string
    public nickname: string
    public likes: string
    public get $likes() {
      return Number(this.likes)
    }
    public gender: _jmUser.Gender
    public update_at: string
    public get $update_at() {
      return dayjs(Number(this.update_at))
    }
    public addtime: string
    public get $addtime() {
      return ((this.addtime))
    }
    public parent_CID: string
    public get $parent_CID() {
      return Number(this.parent_CID)
    }
    public expinfo: _jmUser.RawExpInfo
    public get $expinfo() {
      return new _jmUser.ExpInfo(this.expinfo)
    }
    public name: string
    public content: string // html
    public get $content() {
      return DOMPurify.sanitize(this.content)
    }
    public photo: string
    public get $photo() {
      return new _jmImage.Image(this.photo)
    }
    public get $avatar() {
      return new _jmImage.Image(`/media/users/${this.$UID}.jpg`)
    }
    public spoiler: string
    public get $spoiler() {
      return this.spoiler === '1'
    }
    public toCommonUser() {
      return new _jmUser.CommonUser(this)
    }
    public toJSON() {
      return this.$$raw
    }
    constructor(protected $$raw: RawComment) {
      this.AID = $$raw.AID
      this.BID = $$raw.BID
      this.CID = $$raw.CID
      this.UID = $$raw.UID
      this.username = $$raw.username
      this.nickname = $$raw.nickname
      this.likes = $$raw.likes
      this.gender = $$raw.gender
      this.update_at = $$raw.update_at
      this.addtime = $$raw.addtime
      this.parent_CID = $$raw.parent_CID
      this.expinfo = $$raw.expinfo
      this.name = $$raw.name
      this.content = $$raw.content
      this.photo = $$raw.photo
      this.spoiler = $$raw.spoiler
    }
  }
}