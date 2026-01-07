import { Utils, type uni, } from "delta-comic-core"
import {
  Generated,
  JSONColumnType,
  Selectable,
} from 'kysely'

export const subscribeKey = new Utils.data.SourcedValue<[plugin: string, label: string]>()
export type SubscribeKey_ = Utils.data.SourcedKeyType<typeof subscribeKey>
export type SubscribeKey = Exclude<SubscribeKey_, string>

export interface AuthorSubscribeTable {
  id: Generated<number>
  author: JSONColumnType<uni.item.Author>
  type: 'author'
  key: string
  plugin: string
}
export type AuthorSubscribeItem = Selectable<AuthorSubscribeTable>

export interface EpSubscribeTable {
  id: Generated<number>
  itemKey: string // not f key
  type: 'ep'
  key: string
  plugin: string
}
export type EpSubscribeItem = Selectable<EpSubscribeTable>

export type SubscribeTable = AuthorSubscribeTable | EpSubscribeTable
export type SubscribeItem = AuthorSubscribeItem | EpSubscribeItem