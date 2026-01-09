import { Utils, type uni } from "delta-comic-core"
import {
  JSONColumnType,
  Selectable,
} from 'kysely'
import { db } from "."

export namespace SubscribeDB {

  export const key = new Utils.data.SourcedValue<[plugin: string, label: string]>()
  export type Key_ = Utils.data.SourcedKeyType<typeof key>
  export type Key = Exclude<Key_, string>

  export interface AuthorTable {
    author: JSONColumnType<uni.item.Author>
    itemKey: null
    type: 'author'
    key: string
    plugin: string
  }
  export type AuthorItem = Selectable<AuthorTable>

  export interface EpTable {
    author: null
    itemKey: string // not f key
    type: 'ep'
    key: string
    plugin: string
  }
  export type EpItem = Selectable<EpTable>

  export type Table = AuthorTable | EpTable
  export type Item = AuthorItem | EpItem

  export function getAll() {
    return db.selectFrom('subscribe').selectAll().execute() as Promise<SubscribeDB.Item[]>
  }
}