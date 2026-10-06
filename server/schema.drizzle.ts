import { type RelationsBuilder } from 'drizzle-orm'
import {
  bigint,
  boolean,
  integer,
  jsonb,
  pgEnum,
  text,
  timestamp,
  uuid
} from 'drizzle-orm/pg-core'

import { createModuleTable } from '@lifeforge/drizzle'

const pgTable = createModuleTable()

export const bookFormatEnum = pgEnum('books_library_book_format', [
  'ebook',
  'physical'
])

export const bookCollections = pgTable('collections', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().default(''),
  icon: text('icon').notNull().default('')
})

export const bookLanguages = pgTable('languages', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().default(''),
  icon: text('icon').notNull().default(''),
  code: text('code').notNull().default('')
})

export const bookFileTypes = pgTable('file_types', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().default('')
})

export const bookEntries = pgTable('entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull().default(''),
  authors: text('authors').notNull().default(''),
  md5: text('md5').notNull().default(''),
  year_published: integer('year_published').notNull().default(0),
  publisher: text('publisher').notNull().default(''),
  languages: jsonb('languages').$type<string[]>().notNull().default([]),
  collection: uuid('collection').references(() => bookCollections.id, {
    onDelete: 'set null'
  }),
  extension: text('extension').notNull().default(''),
  edition: text('edition').notNull().default(''),
  size: bigint('size', { mode: 'number' }).notNull().default(0),
  word_count: integer('word_count').notNull().default(0),
  page_count: integer('page_count').notNull().default(0),
  isbn: text('isbn').notNull().default(''),
  formats: bookFormatEnum('formats').array().notNull().default(['ebook']),
  file: text('file').notNull().default(''),
  thumbnail: text('thumbnail').notNull().default(''),
  is_favourite: boolean('is_favourite').notNull().default(false),
  time_started: timestamp('time_started', { mode: 'date' }),
  time_finished: timestamp('time_finished', { mode: 'date' }),
  read_status: text('read_status').notNull().default('unread'),
  created: timestamp('created', { mode: 'date' }).defaultNow().notNull(),
  updated: timestamp('updated', { mode: 'date' }).defaultNow().notNull()
})

export const tables = {
  collections: bookCollections,
  languages: bookLanguages,
  file_types: bookFileTypes,
  entries: bookEntries
}

export const relations = (r: RelationsBuilder<typeof tables>) => ({
  entries: {
    collection_info: r.one.collections({
      from: r.entries.collection,
      to: r.collections.id
    })
  },
  collections: {
    entries: r.many.entries()
  }
})
