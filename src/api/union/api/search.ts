import { bika } from "@/api/bika"
import { jm } from "@/api/jm"
import { Stream } from "@/utils/data"
import type { _uniComic } from "../comic"
import { random } from "lodash-es"
import { cosav } from "@/api/cosav"

export namespace _uniSearch {
  export const createRandomStream = () => Stream.create<bika.comic.BaseComic | jm.comic.BaseComic | cosav.video.BaseVideo>(async function* (signal, that) {
    that.pages.value = Infinity
    that.total.value = Infinity
    while (true) {
      that.page.value++
      switch (random(0, 2)) {
        case 0:
          yield await bika.api.search.getRandomComic(signal)
          break
        case 1:
          yield await jm.api.search.getRandomComics(signal)
          break
        case 2:
          yield await cosav.api.search.getRandomVideo(signal)//jm.api.search.getRandomComics(signal)
          break
      }
    }
  })
}