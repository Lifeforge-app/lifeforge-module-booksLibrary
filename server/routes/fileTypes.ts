import { asc, count, eq } from 'drizzle-orm'
import z from 'zod'

import forge from '../forge'
import { bookEntries, bookFileTypes } from '../schema.drizzle'

const fileTypeAggregateDto = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.number()
})

export const list = forge
  .query({
    description: 'Get all book file types',
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
