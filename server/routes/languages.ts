import { asc, count, eq, sql } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-orm/zod'
import z from 'zod'

import forge from '../forge'
import { bookEntries, bookLanguages } from '../schema.drizzle'

const languageDto = createSelectSchema(bookLanguages)

const languageAggregateDto = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  amount: z.number()
})

const languageInputDto = z.object({
  name: z.string(),
  icon: z.string()
})

export const list = forge
  .query({
    description: 'Get all book languages',
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

export const create = forge
  .mutation({
    description: 'Create a new book language',
    input: {
      body: languageInputDto
    },
    output: {
      CREATED: languageDto
    }
  })
  .callback(async ({ db, body, response }) => {
    const [created] = await db.insert(bookLanguages).values(body).returning()

    return response.created(created)
  })

export const update = forge
  .mutation({
    description: 'Update an existing book language',
    input: {
      query: z.object({
        id: forge.existsIn(z.string(), bookLanguages)
      }),
      body: languageInputDto
    },
    output: {
      OK: languageDto
    }
  })
  .callback(async ({ db, query: { id }, body, response }) => {
    const [updated] = await db
      .update(bookLanguages)
      .set(body)
      .where(eq(bookLanguages.id, id))
      .returning()

    return response.ok(updated)
  })

export const remove = forge
  .mutation({
    description: 'Delete a book language',
    input: {
      query: z.object({
        id: forge.existsIn(z.string(), bookLanguages)
      })
    },
    output: {
      NO_CONTENT: true
    }
  })
  .callback(async ({ db, query: { id }, response }) => {
    await db.delete(bookLanguages).where(eq(bookLanguages.id, id))

    return response.noContent()
  })
