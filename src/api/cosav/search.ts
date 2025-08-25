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

  export  const _ = undefined
}