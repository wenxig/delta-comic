import { Utils, type uni } from "delta-comic-core"
import {
  JSONColumnType,
  Selectable,
} from 'kysely'

export const subscribeKey = new Utils.data.SourcedValue<[plugin: string, label: string]>()
export type SubscribeKey_ = Utils.data.SourcedKeyType<typeof subscribeKey>
export type SubscribeKey = Exclude<SubscribeKey_, string>

export interface AuthorSubscribeTable {
  author: JSONColumnType<uni.item.Author> | null
  type: 'author'
  key: string
  plugin: string
}
export type AuthorSubscribeItem = Selectable<AuthorSubscribeTable>

export interface EpSubscribeTable {
  itemKey: string | null// not f key
  type: 'ep'
  key: string
  plugin: string
}
export type EpSubscribeItem = Selectable<EpSubscribeTable>

export type SubscribeTable = AuthorSubscribeTable | EpSubscribeTable
export type SubscribeItem = AuthorSubscribeItem | EpSubscribeItem