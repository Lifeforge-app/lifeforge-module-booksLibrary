import z from 'zod'

import forge from '../../forge'
import { marcCodeToName } from '../../utils/languages'

import type { ProviderBook, ProviderSearchResult } from './types'

const PER_PAGE = 20

const USER_AGENT = 'LifeForge Books Library'

const OpenLibraryDocSchema = z.object({
  key: z.string(),
  title: z.string(),
  author_name: z.array(z.string()).optional(),
  first_publish_year: z.number().optional(),
  publisher: z.array(z.string()).optional(),
  isbn: z.array(z.string()).optional(),
  language: z.array(z.string()).optional(),
  cover_i: z.number().optional(),
  number_of_pages_median: z.number().optional()
})

const OpenLibraryResponseSchema = z.object({
  docs: z.array(OpenLibraryDocSchema),
  numFound: z.number()
})

export async function searchOpenLibrary(
  q: string,
  page: number
): Promise<ProviderSearchResult> {
  const parsedPage = Math.max(page || 1, 1)

  const url = new URL('https://openlibrary.org/search.json')

  url.searchParams.set('q', q)
  url.searchParams.set('page', String(parsedPage))
  url.searchParams.set('limit', String(PER_PAGE))
  url.searchParams.set(
    'fields',
    [
      'key',
      'title',
      'author_name',
      'first_publish_year',
      'publisher',
      'isbn',
      'language',
      'cover_i',
      'number_of_pages_median'
    ].join(',')
  )

  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT },
    signal: AbortSignal.timeout(10000)
  }).catch(() => null)

  if (!res?.ok) {
    throw new Error('Failed to reach Open Library')
  }

  const parsed = OpenLibraryResponseSchema.safeParse(await res.json())

  if (!parsed.success) {
    throw new Error('Unexpected response from Open Library')
  }

  const { docs, numFound } = parsed.data

  return {
    totalPages: Math.max(Math.ceil(numFound / PER_PAGE), 1),
    results: docs.map(
      (doc): ProviderBook => ({
        key: doc.key,
        title: doc.title,
        authors: (doc.author_name ?? []).join(', '),
        publisher: doc.publisher?.[0] ?? '',
        year: doc.first_publish_year ?? 0,
        isbn: doc.isbn?.[0] ?? '',
        coverUrl: doc.cover_i
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
          : '',
        pageCount: doc.number_of_pages_median ?? 0,
        languages: [...new Set(doc.language ?? [])].map(code => ({
          code,
          name: marcCodeToName(code)
        }))
      })
    )
  }
}

export const covers = forge
  .query({
    description:
      'Get the available cover image IDs for a book from Open Library, resolved by work key, ISBN, or title.',
    input: {
      query: z.object({
        key: z.string().optional(),
        isbn: z.string().optional(),
        title: z.string().optional()
      })
    },
    output: {
      OK: z.object({
        covers: z.array(z.number())
      })
    }
  })
  .callback(async ({ query: { key, isbn, title }, response }) => {
    const covers = new Set<number>()

    const addCovers = (ids?: number[]) => {
      for (const id of ids ?? []) {
        if (id > 0) {
          covers.add(id)
        }
      }
    }

    const resolveWork = async (
      term: string
    ): Promise<{ workKey?: string; coverId?: number } | null> => {
      const url = new URL('https://openlibrary.org/search.json')

      url.searchParams.set('q', term)
      url.searchParams.set('limit', '1')
      url.searchParams.set('fields', 'key,cover_i')

      const res = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT }
      }).catch(() => null)

      if (!res?.ok) {
        return null
      }

      const parsed = z
        .object({
          docs: z.array(
            z.object({
              key: z.string().optional(),
              cover_i: z.number().optional()
            })
          )
        })
        .safeParse(await res.json())

      const doc = parsed.success ? parsed.data.docs[0] : undefined

      return { workKey: doc?.key, coverId: doc?.cover_i }
    }

    const collectCovers = async (workKey?: string, coverId?: number) => {
      addCovers(coverId ? [coverId] : undefined)

      if (!workKey?.startsWith('/works/')) {
        return
      }

      const workRes = await fetch(`https://openlibrary.org${workKey}.json`, {
        headers: { 'User-Agent': USER_AGENT }
      }).catch(() => null)

      if (workRes?.ok) {
        const parsed = z
          .object({ covers: z.array(z.number()).optional() })
          .safeParse(await workRes.json())

        if (parsed.success) {
          addCovers(parsed.data.covers)
        }
      }

      const editionsRes = await fetch(
        `https://openlibrary.org${workKey}/editions.json?limit=100`,
        { headers: { 'User-Agent': USER_AGENT } }
      ).catch(() => null)

      if (editionsRes?.ok) {
        const parsed = z
          .object({
            entries: z
              .array(z.object({ covers: z.array(z.number()).optional() }))
              .optional()
          })
          .safeParse(await editionsRes.json())

        if (parsed.success) {
          for (const entry of parsed.data.entries ?? []) {
            addCovers(entry.covers)
          }
        }
      }
    }

    const trimmedKey = key?.trim()

    if (trimmedKey) {
      await collectCovers(trimmedKey)
    } else {
      const trimmedIsbn = isbn?.trim()

      if (trimmedIsbn) {
        const resolved = await resolveWork(trimmedIsbn)

        if (resolved) {
          await collectCovers(resolved.workKey, resolved.coverId)
        }
      }

      const trimmedTitle = title?.trim()

      if (covers.size === 0 && trimmedTitle) {
        const resolved = await resolveWork(trimmedTitle)

        if (resolved) {
          await collectCovers(resolved.workKey, resolved.coverId)
        }
      }
    }

    return response.ok({ covers: [...covers] })
  })
