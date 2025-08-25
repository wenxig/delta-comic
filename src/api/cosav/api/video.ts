import { importCosav } from "./utils"
import type { cosav as CosavType } from '..'
import { PromiseContent } from "@/utils/data"

export namespace _cosavApiVideo {
  export const getInfo = PromiseContent.fromAsyncFunction((id: string, signal?: AbortSignal) => importCosav(cosav => cosav.api.rest.get<CosavType.video.RawFullVideo>('/video/videoinfo', { signal, params: { id } }).then(v => new cosav.video.FullVideo(v))))
}