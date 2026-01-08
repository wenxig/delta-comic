import { uni } from "delta-comic-core"
import {
  JSONColumnType,
  Selectable,
} from 'kysely'

export interface HistoryTable {
  timestamp: number
  itemKey: string
  ep: JSONColumnType<uni.ep.RawEp>
}


export type HistoryItem = Selectable<HistoryTable>