import type { Plugin } from "@/plugin/define"
import { _jmComic } from "./comic"

export namespace _jmSearch {
  export interface RawPromote {
    id: string
    title: string
    slug: string
    type: string
    filter_val: string | number
    content: _jmComic.RawCommonComic[]
  }
  export class Promote implements RawPromote, Plugin.Struct<RawPromote> {
    public id: string
    public get $id() {
      return Number(this.id)
    }
    public title: string
    public slug: string
    public type: string
    public filter_val: string | number
    public get $filter_val() {
      return Number(this.filter_val)
    }
    public content: _jmComic.RawCommonComic[]
    public get $content() {
      return this.content.map(v => new _jmComic.CommonComic(v))
    }
    public toJSON() {
      return this.$$raw
    }
    constructor(protected $$raw: RawPromote) {
      this.id = $$raw.id
      this.title = $$raw.title
      this.slug = $$raw.slug
      this.type = $$raw.type
      this.filter_val = $$raw.filter_val
      this.content = $$raw.content
    }
  }

  export interface PromoteItem {
    list: _jmComic.RawCommonComic[],
    total: number
  }

  export interface Category {
    id?: string
    title?: string
  }

  export interface WeekBestList {
    categories: {
      id: string,
      title: string,
      time: string
    }[],
    type: {
      id: string,
      title: string
    }[]
  }

  export interface WeekBestItem {
    total: number,
    list: _jmComic.RawCommonComic[]
  }

  export interface ByKeyword {
    search_query: string
    total: string
    content: _jmComic.RawCommonComic[]
  }

  export interface ByCategory extends ByKeyword {
    tags: string[]
  }

  export interface Levelboard {
    day: _jmComic.CommonComic[]
    week: _jmComic.CommonComic[]
    month: _jmComic.CommonComic[]
  }
}