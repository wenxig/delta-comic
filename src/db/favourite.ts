import { AppDB } from "./app"
import { uniq } from "es-toolkit"
import { uni } from "delta-comic-core"
import mitt from "mitt"


export interface FavouriteCard {
  title: string
  private: boolean
  description: string
  createAt: number
}

export namespace FavouriteCardDB {
  const db = AppDB.db

  export const DEFAULT_CARD_ID = 0

  export async function init() {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS favourite_cards (
        title TEXT,
        private INTEGER,
        description TEXT,
        createAt INTEGER PRIMARY KEY
      )
      INSERT INTO favourite_cards (title, private, description, createAt)
      SELECT '我的收藏', 0, '默认收藏夹', ${DEFAULT_CARD_ID}
      WHERE NOT EXISTS (SELECT 1 FROM favourite_cards WHERE createAt = ${DEFAULT_CARD_ID})
    `)
  }

  const emitter = mitt<{
    change: void
  }>()
  export function onChange(cb: () => void) {
    emitter.on('change', cb)
    return () => emitter.off('change', cb)
  }

  export async function upsertCard(card: FavouriteCard) {
    await db.execute(`
      INSERT INTO favourite_cards (title, private, description, createAt) VALUES ($1, $2, $3, $4)
      ON CONFLICT(createAt) DO UPDATE SET title=excluded.title, private=excluded.private, description=excluded.description
    `, [card.title, card.private ? 1 : 0, card.description, card.createAt])
    emitter.emit('change')
  }

  export async function getAll(): Promise<FavouriteCard[]> {
    const result = await db.select<FavouriteCard[]>(`
      SELECT title, private, description, createAt FROM favourite_cards ORDER BY createAt DESC
    `)
    return result.map(r => ({
      title: r.title,
      private: r.private ? true : false,
      description: r.description,
      createAt: r.createAt
    }))
  }

  export async function getBySearch(query: string): Promise<FavouriteCard[]> {
    const result = await db.select<FavouriteCard[]>(`
      SELECT title, private, description, createAt 
      FROM favourite_cards 
      WHERE title LIKE $1
      ORDER BY createAt DESC
    `, [`%${query}%`])
    return result.map(r => ({
      title: r.title,
      private: r.private ? true : false,
      description: r.description,
      createAt: r.createAt
    }))
  }

  export async function removeCard(createAt: number) {
    await db.execute(`
      DELETE FROM favourite_cards WHERE createAt = $1
    `, [createAt])
    emitter.emit('change')
  }

}


export interface RawFavouriteItem {
  itemKey: string
  addTime: number
  belongTo: string
}
export interface RawFavouriteItemJoined {
  itemKey: string
  addTime: number
  belongTo: string
  data: string // `uni.item.RawItem` from AppDB
}
export interface FavouriteItem {
  itemKey: string
  data: uni.item.Item
  addTime: number
  belongTo: number[]
}

export namespace FavouriteItemDB {
  const db = AppDB.db

  const emitter = mitt<{
    change: void
  }>()
  export function onChange(cb: () => void) {
    emitter.on('change', cb)
    return () => emitter.off('change', cb)
  }
  AppDB.onChange(() => emitter.emit('change'))

  export async function init() {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS favourite_items (
        itemKey TEXT PRIMARY KEY,
        addTime INTEGER,
        belongTo TEXT
      )
    `)
  }

  export async function upsertItem(favItem: uni.item.Item, belongTo: FavouriteItem['belongTo'] = [0]) {
    const rfi: RawFavouriteItem = {
      itemKey: favItem.id,
      addTime: Date.now(),
      belongTo: JSON.stringify(belongTo)
    }
    await AppDB.upsertItem(favItem)
    await db.execute(`
      INSERT INTO favourite_items (itemKey, addTime, belongTo) VALUES ($1, $2, $3)
      ON CONFLICT(itemKey) DO UPDATE SET addTime=excluded.addTime, belongTo=excluded.belongTo
    `, [rfi.itemKey, rfi.addTime, rfi.belongTo])

    emitter.emit('change')
  }

  export async function getByKey(itemKey: string): Promise<FavouriteItem | undefined> {
    const [item] = await db.select<RawFavouriteItemJoined[]>(`
      SELECT fi.itemKey, fi.addTime, fi.belongTo, a.item AS data
      FROM favourite_items fi
      JOIN items a ON fi.itemKey = a.key
      WHERE fi.itemKey = $1
    `, [itemKey])
    if (!item) return undefined
    return {
      itemKey: item.itemKey,
      data: uni.item.Item.create(JSON.parse(item.data)),
      addTime: item.addTime,
      belongTo: JSON.parse(item.belongTo)
    }
  }

  export async function addBelongTo(itemKey: string, additions: FavouriteItem['belongTo']) {
    const item = await getByKey(itemKey)
    if (!item) return
    const belongTo = uniq([...item.belongTo, ...additions])
    await upsertItem(item.data, belongTo)
  }

  export async function removeBelongTo(itemKey: string, removals: FavouriteItem['belongTo']) {
    const item = await getByKey(itemKey)
    if (!item) return
    const belongTo = item.belongTo.filter(b => !removals.includes(b))
    await upsertItem(item.data, belongTo)
  }

  export async function getByBelongTo(belongTo: number, search = ''): Promise<FavouriteItem[]> {
    const result = await db.select<RawFavouriteItemJoined[]>(`
      SELECT
        fi.itemKey,
        fi.addTime,
        fi.belongTo,
        a.item AS data
      FROM favourite_items fi
      JOIN items a ON fi.itemKey = a.key
      WHERE EXISTS (
        SELECT 1
        FROM json_each(fi.belongTo)
        WHERE value = $1
      )
      AND a.item LIKE $2
      ORDER BY fi.addTime DESC;
    `, [belongTo, `%${search}%`])
    return result.map(r => ({
      itemKey: r.itemKey,
      data: uni.item.Item.create(JSON.parse(r.data)),
      addTime: r.addTime,
      belongTo: JSON.parse(r.belongTo)
    }))
  }

  export async function countByBelongTo(belongTo: number): Promise<number> {
    const [row] = await db.select<{ count: number }[]>(`
      SELECT COUNT(*) AS count
      FROM favourite_items fi
      WHERE EXISTS (
        SELECT 1
        FROM json_each(fi.belongTo)
        WHERE value = $1
      )
    `, [belongTo])
    return row.count
  }
}

await FavouriteCardDB.init()
await FavouriteItemDB.init()