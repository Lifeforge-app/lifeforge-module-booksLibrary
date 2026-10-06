import { asc, count, eq, sql } from 'drizzle-orm'
import z from 'zod'

import forge from '../forge'
import { bookEntries, bookFileTypes, bookLanguages } from '../schema.drizzle'

const fileTypeAggregateDto = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number()
})

const languageAggregateDto = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  code: z.string(),
  amount: z.number()
})

const readStatusAggregateDto = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  color: z.string(),
  amount: z.number()
})

const STATUSES = [
  { id: '1', name: 'read', icon: 'tabler:progress-check', color: '#22c55e' },
  { id: '2', name: 'reading', icon: 'tabler:progress-bolt', color: '#3b82f6' },
  { id: '3', name: 'unread', icon: 'tabler:progress', color: '#ef4444' }
]

export const fileTypes = forge
  .query({
    description: 'Get all book file types with entry counts',
    output: {
      OK: z.array(fileTypeAggregateDto)
    }
  })
  .callback(async ({ db, response }) => {
    const rows = await db
      .select({
        id: bookFileTypes.id,
        name: bookFileTypes.name,
        amount: count(bookEntries.id)
      })
      .from(bookFileTypes)
      .leftJoin(bookEntries, eq(bookEntries.extension, bookFileTypes.name))
      .groupBy(bookFileTypes.id)
      .orderBy(asc(bookFileTypes.name))

    return response.ok(rows)
  })

export const languages = forge
  .query({
    description: 'Get all book languages with entry counts',
    output: {
      OK: z.array(languageAggregateDto)
    }
  })
  .callback(async ({ db, response }) => {
    const rows = await db
      .select({
        id: bookLanguages.id,
        name: bookLanguages.name,
        icon: bookLanguages.icon,
        code: bookLanguages.code,
        amount: count(bookEntries.id)
      })
      .from(bookLanguages)
      .leftJoin(
        bookEntries,
        sql`jsonb_exists(${bookEntries.languages}, ${bookLanguages.id}::text)`
      )
      .groupBy(bookLanguages.id)
      .orderBy(asc(bookLanguages.name))

    return response.ok(rows)
  })

export const readStatus = forge
  .query({
    description: 'Get all book read statuses with entry counts',
    output: {
      OK: z.array(readStatusAggregateDto)
    }
  })
  .callback(async ({ db, response }) => {
    const rows = await db
      .select({ name: bookEntries.read_status, amount: count() })
      .from(bookEntries)
      .groupBy(bookEntries.read_status)

    const counts = Object.fromEntries(rows.map(r => [r.name, r.amount]))

    return response.ok(
      STATUSES.map(status => ({
        ...status,
        amount: counts[status.name] ?? 0
      }))
    )
  })
