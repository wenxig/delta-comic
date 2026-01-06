import { Utils, type uni, } from "delta-comic-core"
export const subscribeKey = new Utils.data.SourcedValue<[plugin: string, label: string]>()
export type SubscribeKey_ = Utils.data.SourcedKeyType<typeof subscribeKey>
export type SubscribeKey = Exclude<SubscribeKey_, string>

export interface RawAuthorSubscribeItem {
  plugin: string
  type: 'author'
  key: string
  author: string
}
export interface AuthorSubscribeItem {
  author: uni.item.Author
  type: 'author'
  key: string
  plugin: string
}
export interface EpSubscribeItem {
  itemKey: string // not f key
  type: 'ep'
  key: string
  plugin: string
}
export type SubscribeItem = AuthorSubscribeItem | EpSubscribeItem