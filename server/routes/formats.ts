import { arrayContains, count } from 'drizzle-orm'
import z from 'zod'

import forge from '../forge'
import { bookEntries } from '../schema.drizzle'

const formatAggregateDto = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  amount: z.number()
})

export const list = forge
  .query({
    description: 'Get all book formats with their entry counts',
    output: {
      OK: z.array(formatAggregateDto)
    }
  })
  .callback(async ({ db, response }) => {
    const [ebook] = await db
      .select({ value: count() })
      .from(bookEntries)
      .where(arrayContains(bookEntries.formats, ['ebook']))

    const [physical] = await db
      .select({ value: count() })
      .from(bookEntries)
      .where(arrayContains(bookEntries.formats, ['physical']))

    return response.ok([
      {
        id: 'ebook',
        name: 'ebook',
        icon: 'tabler:device-tablet',
        amount: ebook.value
      },
      {
        id: 'physical',
        name: 'physical',
        icon: 'tabler:book',
        amount: physical.value
      }
    ])
  })
