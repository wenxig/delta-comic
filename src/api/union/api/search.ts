import { bika } from "@/api/bika"
import { jm } from "@/api/jm"
import { Stream } from "@/utils/data"
import type { _uniComic } from "../comic"
import { random } from "lodash-es"

export namespace _uniSearch {
  export const createRandomStream = () => Stream.create<bika.comic.BaseComic | jm.comic.BaseComic>(async function* (signal, that) {
    const bikaRandom = bika.api.search.createRandomComicStream()
    const jmRandom = jm.api.search.createRandomComicStream()
    signal.addEventListener('abort', () => {
      bikaRandom.stop()
      jmRandom.stop()
    })
    const data = new Array<bika.comic.BaseComic | jm.comic.BaseComic>()
    that.pages.value = Infinity
    that.total.value = Infinity
    while (true) {
      if (that.pages.value <= that.page.value) return
      that.page.value++
      if (random(0, 1) > 0.5) {
        const result = await bikaRandom.next(true)
        data.push(...(result.value ?? []))
      } else {
        const result = await jmRandom.next(true)
        data.push(...(result.value ?? []))
      }
      yield data
    }
  })
}