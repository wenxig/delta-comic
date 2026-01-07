import { uni } from "delta-comic-core"
import {
  Generated,
  JSONColumnType,
  Selectable,
} from 'kysely'

export interface HistoryTable {
  id: Generated<number>
  timestamp: number
  itemKey: string
  ep: JSONColumnType<uni.ep.RawEp>
}


export type HistoryItem = Selectable<HistoryTable>