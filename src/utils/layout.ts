import { toRef } from "@vueuse/core"
import { last, remove } from "lodash-es"
import { computed, onUnmounted, shallowReactive, shallowRef, watch, type MaybeRefOrGetter, type ComputedRef } from "vue"

export const allPopups = shallowRef(0)
const allLayers = shallowReactive<symbol[]>([])
export const useZIndex = (show: MaybeRefOrGetter<boolean>): [index: ComputedRef<number>, isLast: ComputedRef<boolean>, stopUse: () => void] => {
  const th = Symbol('popup')
  const isShow = toRef(show)
  const stop = watch(isShow, isShow => {
    if (isShow) {
      allPopups.value++
      allLayers.push(th)
    } else {
      allPopups.value--
      remove(allLayers, t => t == th)
    }
  }, { immediate: true })
  try {
    onUnmounted(stop)
  } catch { }
  return [computed(() => (allLayers.indexOf(th) + 1) * 10), computed(() => last(allLayers) == th), stop]
}