import { _uniComic } from "./comic"
import { _uniImage } from "./image"
import { _uniSearch } from './api/search'
import type { jm } from "../jm"
import type { bika } from "../bika"
export namespace uni {
  export type SearchMode = jm.SearchMode | bika.SearchMode
  export type SearchSource = 'jm' | 'bika'
  export import comic = _uniComic
  export import image = _uniImage
}
export namespace uni.api {
  export import search = _uniSearch
}