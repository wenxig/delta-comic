import { PromiseContent } from "@/utils/data"
import { importJm } from "./utils"
import type { jm as JmType } from '..'

export namespace _jmApiSearch {
  export const getPromote = PromiseContent.fromAsyncFunction((page = 1, signal?: AbortSignal) =>
    importJm(jm => jm.api.rest.get<JmType.search.RawPromote[]>(`/promote?page=${page}`, { signal }).then(v => v.map(v => new jm.search.Promote(v)))))
}