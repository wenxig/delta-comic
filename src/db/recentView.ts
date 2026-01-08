import {
  Selectable,
} from 'kysely'
import { db } from '.'
import { uni, Utils } from 'delta-comic-core'
export interface RecentViewTable {
  timestamp: number
  itemKey: string
  isViewed: boolean
}
export type RecentViewItem = Selectable<RecentViewTable>

export namespace RecentDB {
  export function insert(item: uni.item.Item | uni.item.RawItem) {
    return db.transaction()
      .setIsolationLevel('serializable')
      .execute(async () => {
        await db.replaceInto('itemStore')
          .values({
            item: Utils.data.Struct.toRaw(item),
            key: item.id
          })
          .execute()
        await db.replaceInto('recentView')
          .values({
            isViewed: false,
            itemKey: item.id,
            timestamp: Date.now()
          })
          .execute()
      })
  }
}