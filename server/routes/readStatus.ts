import { count } from 'drizzle-orm'
import z from 'zod'

import forge from '../forge'
import { bookEntries } from '../schema.drizzle'

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

export const list = forge
  .query({
    description: 'Get all book read statuses',
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
