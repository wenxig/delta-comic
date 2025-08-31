import type { Plugin } from "@/plugin/define"
import type { cosav } from "."
import { _cosavVideo } from "./video"

export namespace _cosavSearch {
  export interface CategoriesItem {
    CHID: string
    bg_color: string
    has_sub: boolean
    icon: string
    name: string
    photo: string
    slug: string
  }

  export interface CategoriesSubItem {
    CHID: string
    has_sub: boolean
    name: string
    photo: string
    slug: string
    total: number
  }

  export interface RawSettings {
    header_banner: {
      link: string
      image: string
      adv_sale_type: 'own' | 'sale'
    }[]
    game_banners: {
      link: string
      image: string
      adv_sale_type: 'own' | 'sale'
    }[]
    api_host: string
    img_host: string
    base_url: string
    vod_host: string
    vpn_url: string
    p1_player_before_adv: number
    p1_3366_adv: number
    p1_player_before_adv_sec: number
    p2_player_before_adv: number
    p2_3366_adv: number
    p2_player_before_adv_sec: number
    vip_icon: number
    index_page: {
      key: string
      name: string
      more: {
        tags: string
        order: cosav.SortType
      },
      list: _cosavVideo.RawCommonVideo[]
    }[]
    social_media: {
      neme: string
      link: string
      icon: string
    }[]
    version: string
    test_version: string
    ios_version: string
    ios_test_version: string
    ios_store_link: string
    ad_cache_version: string
    version_info: string
    download_url: string
    app_landing_page: string
    react_version: string
    react_test_version: string
    react_ios_version: string
    react_ios_test_version: string
    react_version_info: string

  }
  export class Settings implements RawSettings, Plugin.Struct<RawSettings> {
    public toJSON() {
      return this.$$raw
    }
    public header_banner: {
      link: string
      image: string
      adv_sale_type: 'own' | 'sale'
    }[]
    public game_banners: {
      link: string
      image: string
      adv_sale_type: 'own' | 'sale'
    }[]
    public api_host: string
    public img_host: string
    public base_url: string
    public vod_host: string
    public vpn_url: string
    public p1_player_before_adv: number
    public p1_3366_adv: number
    public p1_player_before_adv_sec: number
    public p2_player_before_adv: number
    public p2_3366_adv: number
    public p2_player_before_adv_sec: number
    public vip_icon: number
    public index_page: {
      key: string
      name: string
      more: {
        tags: string
        order: cosav.SortType
      },
      list: _cosavVideo.RawCommonVideo[]
    }[]
    public get $index_page() {
      const v = this.index_page
      return v.map(v => {
        return {
          ...v,
          list: v.list.map(v => new _cosavVideo.CommonVideo(v))
        }
      })
    }
    public social_media: {
      neme: string
      link: string
      icon: string
    }[]
    public version: string
    public test_version: string
    public ios_version: string
    public ios_test_version: string
    public ios_store_link: string
    public ad_cache_version: string
    public version_info: string
    public download_url: string
    public app_landing_page: string
    public react_version: string
    public react_test_version: string
    public react_ios_version: string
    public react_ios_test_version: string
    public react_version_info: string
    constructor(protected $$raw: RawSettings) {
      this.header_banner = $$raw.header_banner
      this.game_banners = $$raw.game_banners
      this.api_host = $$raw.api_host
      this.img_host = $$raw.img_host
      this.base_url = $$raw.base_url
      this.vod_host = $$raw.vod_host
      this.vpn_url = $$raw.vpn_url
      this.p1_player_before_adv = $$raw.p1_player_before_adv
      this.p1_3366_adv = $$raw.p1_3366_adv
      this.p1_player_before_adv_sec = $$raw.p1_player_before_adv_sec
      this.p2_player_before_adv = $$raw.p2_player_before_adv
      this.p2_3366_adv = $$raw.p2_3366_adv
      this.p2_player_before_adv_sec = $$raw.p2_player_before_adv_sec
      this.vip_icon = $$raw.vip_icon
      this.index_page = $$raw.index_page
      this.social_media = $$raw.social_media
      this.version = $$raw.version
      this.test_version = $$raw.test_version
      this.ios_version = $$raw.ios_version
      this.ios_test_version = $$raw.ios_test_version
      this.ios_store_link = $$raw.ios_store_link
      this.ad_cache_version = $$raw.ad_cache_version
      this.version_info = $$raw.version_info
      this.download_url = $$raw.download_url
      this.app_landing_page = $$raw.app_landing_page
      this.react_version = $$raw.react_version
      this.react_test_version = $$raw.react_test_version
      this.react_ios_version = $$raw.react_ios_version
      this.react_ios_test_version = $$raw.react_ios_test_version
      this.react_version_info = $$raw.react_version_info
    }
  }
}