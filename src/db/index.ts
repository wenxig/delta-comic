import { appDataDir } from '@tauri-apps/api/path'
import { CamelCasePlugin, Kysely, Migrator, type Migration, type SelectQueryBuilder } from 'kysely'
import { TauriSqliteDialect } from 'kysely-dialect-tauri'
import Database from '@tauri-apps/plugin-sql'
import type { ItemStoreDB } from './itemStore'
import * as fs from '@tauri-apps/plugin-fs'
import { shallowRef, watchEffect, onUnmounted, shallowReadonly } from "vue"
import mitt from 'mitt'
import type { FavouriteDB } from './favourite'
import { debounce } from 'es-toolkit'
import { SerializePlugin } from 'kysely-plugin-serialize'
import type { HistoryDB } from './history'
import { type RecentDB } from './recentView'
import type { SubscribeDB } from './subscribe'
const migrations = import.meta.glob<Migration>('./migrations/*.ts', { eager: true })

const data = await appDataDir()

export interface DB {
  itemStore: ItemStoreDB.Table
  favouriteCard: FavouriteDB.CardTable
  favouriteItem: FavouriteDB.ItemTable
  history: HistoryDB.Table
  recentView: RecentDB.Table
  subscribe: SubscribeDB.Table
}
const database = await Database.load(`sqlite:${data}app.db`)
await database.execute('PRAGMA foreign_keys = ON;')
const emitter = mitt<{
  onChange: void
}>()

export const db = new Kysely<DB>({
  dialect: new TauriSqliteDialect({
    database
  }),
  plugins: [
    new CamelCasePlugin(),
    new SerializePlugin()
  ]
})
const migrator = new Migrator({
  db,
  provider: {
    async getMigrations() {
      return migrations
    },
  },
})
await migrator.migrateToLatest()

fs.watch(database.path, debounce(() => {
  emitter.emit('onChange')
}, 500))

export function useDBComputed<T>(queryFn: () => Promise<T> | T, initial: T) {
  const data = shallowRef(initial)
  const handle = async () => {
    data.value = await queryFn()
  }
  const watcher = watchEffect(handle)
  emitter.on('onChange', handle)
  onUnmounted(() => {
    emitter.off('onChange', handle)
    watcher.stop()
  })
  return shallowReadonly(data)
}

export namespace DBUtils {
  export async function countDb(sql: SelectQueryBuilder<DB, any, object>) {
    const v = await sql.select(db => db.fn.countAll<number>().as('_count')).executeTakeFirstOrThrow()
    return v._count
  } 
}