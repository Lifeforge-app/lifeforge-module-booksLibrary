import { asc, count, eq } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-orm/zod'
import z from 'zod'

import forge from '../forge'
import { bookCollections, bookEntries } from '../schema.drizzle'

const collectionDto = createSelectSchema(bookCollections)

const collectionAggregateDto = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  amount: z.number()
})

const collectionInputDto = z.object({
  name: z.string(),
  icon: z.string()
})

export const list = forge
  .query({
    description:
      'Get all book collections. If the user asks to list books in a specific collection, call this tool first to get the collection ID.',
    output: {
      OK: z.array(collectionAggregateDto)
    }
  })
  .callback(async ({ db, response }) => {
    const rows = await db
      .select({
        id: bookCollections.id,
        name: bookCollections.name,
        icon: bookCollections.icon,
        amount: count(bookEntries.id)
      })
      .from(bookCollections)
      .leftJoin(bookEntries, eq(bookEntries.collection, bookCollections.id))
      .groupBy(bookCollections.id)
      .orderBy(asc(bookCollections.name))

    return response.ok(rows)
  })

export const create = forge
  .mutation({
    description: 'Create a new book collection',
    input: {
      body: collectionInputDto
    },
    output: {
      CREATED: collectionDto
    }
  })
  .callback(async ({ db, body, response }) => {
    const [created] = await db.insert(bookCollections).values(body).returning()

    return response.created(created)
  })

export const update = forge
  .mutation({
    description: 'Update an existing book collection',
    input: {
      query: z.object({
        id: forge.existsIn(z.string(), bookCollections)
      }),
      body: collectionInputDto
    },
    output: {
      OK: collectionDto
    }
  })
  .callback(async ({ db, query: { id }, body, response }) => {
    const [updated] = await db
      .update(bookCollections)
      .set(body)
      .where(eq(bookCollections.id, id))
      .returning()

    return response.ok(updated)
  })

export const remove = forge
  .mutation({
    description: 'Delete a book collection',
    input: {
      query: z.object({
        id: forge.existsIn(z.string(), bookCollections)
      })
    },
    output: {
      NO_CONTENT: true
    }
  })
  .callback(async ({ db, query: { id }, response }) => {
    await db.delete(bookCollections).where(eq(bookCollections.id, id))

    return response.noContent()
  })
