import { appDataDir } from '@tauri-apps/api/path'
import { Kysely } from 'kysely'
import { TauriSqliteDialect } from 'kysely-dialect-tauri'
import Database from '@tauri-apps/plugin-sql'
import type { ItemStoreTable } from './app'
import * as fs from '@tauri-apps/plugin-fs'
import { shallowRef, watchEffect, onUnmounted, computed } from "vue"
import mitt from 'mitt'
import type { FavouriteCardTable, FavouriteItemTable } from './favourite'

const data = await appDataDir()

interface AppKyselyDatabase {
  itemStore: ItemStoreTable
  favouriteCard: FavouriteCardTable
  favouriteItem: FavouriteItemTable
}

export const db = new Kysely<AppKyselyDatabase>({
  dialect: new TauriSqliteDialect({
    database: prefix => Database.load(`${prefix}${data}app.db`)
  }),
})
const emitter = mitt<{
  onChange: void
}>()
fs.watch(`${data}app.db`, () => {
  emitter.emit('onChange')
})
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