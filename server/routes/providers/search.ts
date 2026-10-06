import { inArray } from 'drizzle-orm'
import z from 'zod'

import forge from '../../forge'
import { bookEntries } from '../../schema.drizzle'

import { searchDouban } from './douban'
import { searchGoodreads } from './goodreads'
import { searchKingstone } from './kingstone'
import { searchOpenLibrary } from './openLibrary'
import type { ProviderBook, ProviderSearchResult } from './types'

const PROVIDERS = [
  'openlibrary',
  'goodreads',
  'douban',
  'kingstone'
] as const

type Provider = (typeof PROVIDERS)[number]

const searchResultDto = z.object({
  key: z.string(),
  title: z.string(),
  authors: z.string(),
  publisher: z.string(),
  year: z.number(),
  isbn: z.string(),
  coverUrl: z.string(),
  pageCount: z.number(),
  languages: z.array(
    z.object({
      code: z.string(),
      name: z.string()
    })
  ),
  source: z.enum(PROVIDERS),
  existed: z.boolean()
})

export const search = forge
  .query({
    description:
      'Search books across all providers (Open Library, Goodreads, Douban, Kingstone) at once and return the combined results with their source.',
    input: {
      query: z.object({
        q: z.string().min(1, 'Query must not be empty'),
        page: z.string().optional().default('1'),
        provider: z.enum(PROVIDERS).optional()
      })
    },
    output: {
      OK: z.object({
        page: z.number(),
        totalPages: z.number(),
        totalItems: z.number(),
        results: z.array(searchResultDto)
      })
    }
  })
  .callback(async ({ db, query: { q, page, provider }, response }) => {
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1)

    const allProviders: {
      provider: Provider
      run: () => Promise<ProviderSearchResult>
    }[] = [
      { provider: 'openlibrary', run: () => searchOpenLibrary(q, parsedPage) },
      { provider: 'goodreads', run: () => searchGoodreads(q, parsedPage) },
      { provider: 'douban', run: () => searchDouban(q, parsedPage) },
      { provider: 'kingstone', run: () => searchKingstone(q, parsedPage) }
    ]

    const providers = provider
      ? allProviders.filter(item => item.provider === provider)
      : allProviders

    const settled = await Promise.allSettled(
      providers.map(item => item.run())
    )

    let totalPages = 1

    const groups: { provider: Provider; books: ProviderBook[] }[] = []

    settled.forEach((outcome, index) => {
      if (outcome.status !== 'fulfilled') {
        return
      }

      totalPages = Math.max(totalPages, outcome.value.totalPages)

      groups.push({
        provider: providers[index].provider,
        books: outcome.value.results
      })
    })

    const isbns = [
      ...new Set(groups.flatMap(group => group.books.map(book => book.isbn)))
    ].filter(Boolean)

    const existing = isbns.length
      ? await db
          .select({ isbn: bookEntries.isbn })
          .from(bookEntries)
          .where(inArray(bookEntries.isbn, isbns))
      : []

    const existingIsbns = new Set(existing.map(row => row.isbn))

    const results: z.infer<typeof searchResultDto>[] = []

    for (const { provider, books } of groups) {
      for (const book of books) {
        results.push({
          ...book,
          source: provider,
          existed: book.isbn !== '' && existingIsbns.has(book.isbn)
        })
      }
    }

    return response.ok({
      page: parsedPage,
      totalPages: Math.max(totalPages, 1),
      totalItems: results.length,
      results
    })
  })
