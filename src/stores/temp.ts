import { defineStore } from "pinia"
import { reactive, shallowReactive, type Reactive } from "vue"

export const useTemp = defineStore('temp', () => {
  const tempBase = shallowReactive(new Map<string, any>())
  const $apply = <T extends object>(id: string, def: () => T) => {
    id = `reactive:${id}`
    if (!tempBase.has(id)) tempBase.set(id, reactive(def()))
    const store: Reactive<T> = tempBase.get(id)
    return store
  }
  const $has = (id: string): boolean => {
    id = `reactive:${id}`
    return tempBase.has(id)
  }
  const $onlyGet = <T extends object>(id: string): Reactive<T> => {
    id = `reactive:${id}`
    return tempBase.get(id)
  }
  const $applyRaw = <T extends object>(id: string, def: () => T) => {
    id = `raw:${id}`
    if (!tempBase.has(id)) tempBase.set(id, def())
    const store: T = tempBase.get(id)
    return store
  }
  const $hasRaw = (id: string): boolean => {
    id = `raw:${id}`
    return tempBase.has(id)
  }
  const $onlyGetRaw = <T extends object>(id: string): Reactive<T> => {
    id = `raw:${id}`
    return tempBase.get(id)
  }
  return { $apply, $has, $onlyGet, $applyRaw, $hasRaw, $onlyGetRaw }
})