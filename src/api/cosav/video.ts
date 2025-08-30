import type { Plugin } from "@/plugin/define"
import dayjs from "dayjs"

export namespace _cosavVideo {
  export interface RawBaseVideo {
    id: string
    photo: string
    title: string
    duration: string
    viewnumber: string
    is_vip: string
    in_top: string
    channel: string
    cos_works: string
    cos_role: string
    author: string
    barcode: string
    single_sale: string
    sale_point: string
    likes: string
    tags: string[]
    addtime: string
    adddate: string
    is_exclusive: boolean
    group_id: string
  }
  export class BaseVideo implements RawBaseVideo, Plugin.Struct<RawBaseVideo> {
    public static is(v: unknown): v is BaseVideo {
      return v instanceof BaseVideo
    }
    public id: string
    public photo: string
    public title: string
    public duration: string
    public get $duration() {
      return Number(this.duration)
    }
    public get $UiDuration() {
      const totalSeconds = Math.floor(parseFloat(this.duration))
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60
      const stringHours = hours.toString()
      const base = `${minutes.toString()}:${seconds.toString().padStart(2, '0')}`
      if (hours > 0) return `${stringHours}:${base}`
      return base
    }
    public viewnumber: string
    public get $viewnumber() {
      return Number(this.viewnumber)
    }
    public is_vip: string
    public in_top: string
    public channel: string
    public cos_works: string
    public get $cos_works() {
      return this.cos_works.split(' ')
    }
    public cos_role: string
    public get $cos_role() {
      return this.cos_role.split(' ')
    }
    public author: string
    public barcode: string
    public single_sale: string
    public sale_point: string
    public likes: string
    public get $likes() {
      return Number(this.likes)
    }
    public tags: string[]
    public addtime: string
    public adddate: string
    public get $adddate() {
      return dayjs(this.adddate, 'YYYY-MM-DD')
    }
    public is_exclusive: boolean
    public group_id: string

    public toJSON(){
      return this.$$raw
    }
    constructor(protected $$raw: RawBaseVideo) {
      this.id = $$raw.id
      this.photo = $$raw.photo
      this.title = $$raw.title
      this.duration = $$raw.duration
      this.viewnumber = $$raw.viewnumber
      this.is_vip = $$raw.is_vip
      this.in_top = $$raw.in_top
      this.channel = $$raw.channel
      this.cos_works = $$raw.cos_works
      this.cos_role = $$raw.cos_role
      this.author = $$raw.author
      this.barcode = $$raw.barcode
      this.single_sale = $$raw.single_sale
      this.sale_point = $$raw.sale_point
      this.likes = $$raw.likes
      this.tags = $$raw.tags
      this.addtime = $$raw.addtime
      this.adddate = $$raw.adddate
      this.is_exclusive = $$raw.is_exclusive
      this.group_id = $$raw.group_id
    }
  }

  export interface RawCommonVideo extends RawBaseVideo {
    channel_name: string
    channel_bg_color: null
    group_order: string
  }
  export class CommonVideo extends BaseVideo implements RawCommonVideo, Plugin.Struct<RawCommonVideo> {
    public static override is(v: unknown): v is CommonVideo {
      return v instanceof CommonVideo
    }
    public channel_name: string
    public channel_bg_color: null
    public group_order: string
    public override toJSON() {
      return this.$$raw
    }
    constructor(protected override $$raw: RawCommonVideo) {
      super($$raw)
      this.channel_name = $$raw.channel_name
      this.channel_bg_color = $$raw.channel_bg_color
      this.group_order = $$raw.group_order
    }
  }

  export interface RawFullVideo extends RawBaseVideo {
    type: string
    addtimestamp: string
    dislikes: string
    like_rate: string
    is_vip_limited_time: string
    vip_limited_time_start: string
    username: string
    user_avatar: string
    company: string
    series: string
    thank_vendor_text: string
    thank_vendor_url: string
    video_url: string[]
    video_url_vip: string[]
    video_img: string
    can_play: boolean
    can_play_status: string
    can_play_msg: string
    comments: string
    cnxh: RawCommonVideo[]
  }
  export class FullVideo extends BaseVideo implements RawFullVideo, Plugin.Struct<RawFullVideo> {
    public static override is(v: unknown): v is FullVideo {
      return v instanceof FullVideo
    }
    public type: string
    public addtimestamp: string
    public dislikes: string
    public like_rate: string
    public is_vip_limited_time: string
    public vip_limited_time_start: string
    public username: string
    public user_avatar: string
    public company: string
    public series: string
    public thank_vendor_text: string
    public thank_vendor_url: string
    public video_url: string[]
    public video_url_vip: string[]
    public video_img: string
    public can_play: boolean
    public can_play_status: string
    public can_play_msg: string
    public comments: string
    public cnxh: RawCommonVideo[]
    public get $cnxh() {
      return this.cnxh.map(v => new CommonVideo(v))
    }
    public get $addtimestamp() {
      return dayjs(Number(this.addtimestamp))
    }
    public get $dislikes() {
      return Number(this.dislikes)
    }
    public get $likeRate() {
      return Number(this.like_rate)
    }

    public override toJSON() {
      return this.$$raw
    }
    constructor(protected override $$raw: RawFullVideo) {
      super($$raw)
      this.type = $$raw.type
      this.addtimestamp = $$raw.addtimestamp
      this.dislikes = $$raw.dislikes
      this.like_rate = $$raw.like_rate
      this.is_vip_limited_time = $$raw.is_vip_limited_time
      this.vip_limited_time_start = $$raw.vip_limited_time_start
      this.username = $$raw.username
      this.user_avatar = $$raw.user_avatar
      this.company = $$raw.company
      this.series = $$raw.series
      this.thank_vendor_text = $$raw.thank_vendor_text
      this.thank_vendor_url = $$raw.thank_vendor_url
      this.video_url = $$raw.video_url
      this.video_url_vip = $$raw.video_url_vip
      this.video_img = $$raw.video_img
      this.can_play = $$raw.can_play
      this.can_play_status = $$raw.can_play_status
      this.can_play_msg = $$raw.can_play_msg
      this.comments = $$raw.comments
      this.cnxh = $$raw.cnxh
    }
  }
}