import { appDataDir } from '@tauri-apps/api/path'
import { Kysely } from 'kysely'
import { TauriSqliteDialect } from 'kysely-dialect-tauri'
import Database from '@tauri-apps/plugin-sql'
import type { ItemStoreTable } from './app'
import * as fs from '@tauri-apps/plugin-fs'
import { shallowRef, watchEffect, onUnmounted, computed } from "vue"
import mitt from 'mitt'
import type { FavouriteCardTable, FavouriteItemTable } from './favourite'
import { debounce } from 'es-toolkit'
import { SerializePlugin } from 'kysely-plugin-serialize'
import type { HistoryTable } from './history'
import type { RecentViewTable } from './recentView'
import type { SubscribeTable } from './subscribe'

const data = await appDataDir()

interface AppKyselyDatabase {
  itemStore: ItemStoreTable
  favouriteCard: FavouriteCardTable
  favouriteItem: FavouriteItemTable
  history: HistoryTable
  recentView: RecentViewTable
  subscribe: SubscribeTable
}

export const db = new Kysely<AppKyselyDatabase>({
  dialect: new TauriSqliteDialect({
    database: prefix => Database.load(`${prefix}${data}app.db`)
  }),
  plugins: [
    new SerializePlugin()
  ]
})
const emitter = mitt<{
  onChange: void
}>()

fs.watch(`${data}app.db`, debounce(() => {
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
  return computed<T>(() => data.value)
}