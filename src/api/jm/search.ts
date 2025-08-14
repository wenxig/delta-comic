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
  export class Promote implements RawPromote {
    public id: string
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
    constructor(v: RawPromote) {
      this.id = v.id
      this.title = v.title
      this.slug = v.slug
      this.type = v.type
      this.filter_val = v.filter_val
      this.content = v.content
    }
  }

  export interface PromoteItem {
    list:_jmComic.RawCommonComic[],
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
}