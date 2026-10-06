import { eq } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-orm/zod'
import z from 'zod'

import forge from '../forge'
import { bookLanguages } from '../schema.drizzle'
import { isValidMarcCode, marcCodeToName } from '../utils/languages'

const languageDto = createSelectSchema(bookLanguages)

const languageInputDto = z.object({
  name: z.string(),
  icon: z.string(),
  code: z
    .string()
    .refine(isValidMarcCode, 'Must be a valid MARC 21 language code')
})

export const ensure = forge
  .mutation({
    description:
      'Find book languages by MARC code, creating any that do not exist yet',
    input: {
      body: z.object({ codes: z.array(z.string()) })
    },
    output: {
      OK: z.array(languageDto)
    }
  })
  .callback(async ({ db, body: { codes }, response }) => {
    const normalized = [
      ...new Set(
        codes.map(code => code.trim().toLowerCase()).filter(isValidMarcCode)
      )
    ]

    const result: z.infer<typeof languageDto>[] = []

    for (const code of normalized) {
      const existing = await db
        .select()
        .from(bookLanguages)
        .where(eq(bookLanguages.code, code))

      if (existing.length > 0) {
        result.push(...existing)
        continue
      }

      const [created] = await db
        .insert(bookLanguages)
        .values({
          name: marcCodeToName(code),
          icon: 'tabler:language',
          code
        })
        .returning()

      result.push(created)
    }

    return response.ok(result)
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
