import {
  Generated,
  Selectable,
} from 'kysely'
export interface RecentViewTable {
  id: Generated<number>
  timestamp: number
  itemKey: string
  isViewed: boolean
}
export type RecentViewItem = Selectable<RecentViewTable>