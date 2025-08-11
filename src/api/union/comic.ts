import { isArray } from "lodash-es"
import { bika } from "../bika"
import { jm } from "../jm"
import { _uniImage } from "./image"

export namespace _uniComic {
  export class Comic<T extends bika.comic.BaseComic | jm.comic.BaseComic> {
    public cover: _uniImage.Image
    public title: string
    public id: string
    public categories: string[]
    public author: string[]
    constructor(v: T) {
      if (bika.comic.BaseComic.is(v)) {
        this.cover = new _uniImage.Image(v.$thumb)
        this.title = v.title
        this.id = v._id
        this.categories = v.categories
        this.author = v.$author
      } else {
        this.cover = new _uniImage.Image(v.$thumb)
        this.title = v.name
        this.id = v.$id.toString()
        this.categories = []
        this.author = []
        this.author = isArray(v.author) ? v.author : v.author.split(' ')
        if (jm.comic.CommonComic.is(v)) this.categories = <string[]>[v.category.title, v.category_sub.title].filter(Boolean)
      }
    }
  }
}