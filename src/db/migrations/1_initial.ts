import type { Kysely } from 'kysely'
import type { DB } from '..'

export async function up(db: Kysely<DB>) {
  await db.schema
    .createTable('itemStore')
    .addColumn('key', 'text', col => col.primaryKey().notNull())
    .addColumn('item', 'text', col => col.notNull())

  // recentView begin
  await db.schema
    .createTable('recentView')
    .addColumn('timestamp', 'datetime', col => col.notNull().primaryKey())
    .addColumn('itemKey', 'text', col => col.notNull().unique())
    .addForeignKeyConstraint(
      'itemKeyForeign',
      ['itemKey'],
      'itemStore',
      ['item'],
      cb => cb.onUpdate('cascade')
    )
    .addColumn('isViewed', 'boolean', col => col.notNull())
    .execute()

  await db.schema
    .createIndex('recent_id_timestamp')
    .on('recentView')
    .columns(['id', 'timestamp desc'])
    .execute()
  // recentView end
}