import z from 'zod'

import forge from '../../forge'

import type { ProviderBook, ProviderSearchResult } from './types'

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'

const PER_PAGE = 20

interface GoodreadsAutocompleteItem {
  imageUrl?: string
  bookId?: string | number
  title?: string
  bookTitleBare?: string
  numPages?: number
  author?: { name?: string }
}

function headers() {
  return { 'User-Agent': USER_AGENT }
}

function hiResCover(url: string) {
  return url.replace(/\._[A-Z0-9_]+_\.(jpe?g|png)$/i, '._SL500_.$1')
}

function stripTags(html: string) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

async function searchAutocomplete(q: string): Promise<ProviderBook[]> {
  const res = await fetch(
    `https://www.goodreads.com/book/auto_complete?format=json&q=${encodeURIComponent(q)}`,
    { headers: headers(), signal: AbortSignal.timeout(10000) }
  ).catch(() => null)

  if (!res?.ok) {
    return []
  }

  const json = (await res.json().catch(() => null)) as
    | GoodreadsAutocompleteItem[]
    | null

  if (!Array.isArray(json)) {
    return []
  }

  return json
    .filter(item => item.bookId)
    .map(item => ({
      key: String(item.bookId),
      title: item.bookTitleBare || item.title || '',
      authors: item.author?.name ?? '',
      publisher: '',
      year: 0,
      isbn: '',
      coverUrl: hiResCover(item.imageUrl ?? ''),
      pageCount: item.numPages ?? 0,
      languages: []
    }))
}

async function searchHtml(
  q: string,
  page: number
): Promise<{ totalPages: number; results: ProviderBook[] }> {
  const url = `https://www.goodreads.com/search?q=${encodeURIComponent(
    q
  )}&search_type=books${page > 1 ? `&page=${page}` : ''}`

  const res = await fetch(url, {
    headers: headers(),
    signal: AbortSignal.timeout(10000)
  }).catch(() => null)

  if (!res?.ok) {
    throw new Error('Failed to reach Goodreads')
  }

  const html = await res.text()

  const blocks =
    html.match(
      /<tr itemscope itemtype="http:\/\/schema\.org\/Book">[\s\S]*?<\/tr>/g
    ) ?? []

  const results = blocks
    .map((block): ProviderBook | null => {
      const id = block.match(/\/book\/show\/(\d+)/)?.[1]

      if (!id) {
        return null
      }

      const title = block.match(
        /class="bookTitle"[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/
      )?.[1]

      const authors = block.match(
        /class="authorName"[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/
      )?.[1]

      const coverUrl = hiResCover(
        block.match(/class="bookCover"[^>]*src="([^"]+)"/)?.[1] ?? ''
      )

      const year =
        parseInt(block.match(/published\s+(\d{4})/)?.[1] ?? '0', 10) || 0

      return {
        key: id,
        title: stripTags(title ?? ''),
        authors: stripTags(authors ?? ''),
        publisher: '',
        year,
        isbn: '',
        coverUrl,
        pageCount: 0,
        languages: []
      }
    })
    .filter((item): item is ProviderBook => item !== null)

  return {
    totalPages: results.length >= PER_PAGE ? page + 1 : page,
    results
  }
}

export async function searchGoodreads(
  q: string,
  page: number
): Promise<ProviderSearchResult> {
  const parsedPage = Math.max(page || 1, 1)

  const autocomplete = await searchAutocomplete(q)

  if (autocomplete.length > 0) {
    return { totalPages: 1, results: autocomplete }
  }

  return searchHtml(q, parsedPage)
}

interface GoodreadsApolloEntry {
  title?: string
  imageUrl?: string
  details?: {
    publisher?: string
    publicationTime?: number
    isbn?: string
    isbn13?: string
    numPages?: number
  }
  primaryContributorEdge?: { node?: { __ref?: string } }
  secondaryContributorEdges?: { node?: { __ref?: string } | string }[]
}

function extractNextData(html: string): unknown {
  const match = html.match(
    /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/
  )

  if (!match) {
    return null
  }

  try {
    return JSON.parse(match[1])
  } catch {
    return null
  }
}

export const detail = forge
  .query({
    description: 'Get detailed book metadata from Goodreads by book id',
    input: {
      query: z.object({ id: z.string() })
    },
    output: {
      OK: z.object({
        title: z.string(),
        authors: z.string(),
        publisher: z.string(),
        year: z.number(),
        isbn: z.string(),
        pageCount: z.number(),
        coverUrl: z.string()
      })
    }
  })
  .callback(async ({ query: { id }, response }) => {
    const res = await fetch(`https://www.goodreads.com/en/book/show/${id}`, {
      headers: headers(),
      signal: AbortSignal.timeout(10000)
    }).catch(() => null)

    if (!res?.ok) {
      return response.badRequest('Failed to reach Goodreads')
    }

    const data = extractNextData(await res.text()) as {
      props?: { pageProps?: { apolloState?: Record<string, unknown> } }
    } | null

    const apollo = data?.props?.pageProps?.apolloState

    if (!apollo) {
      return response.badRequest('Unexpected response from Goodreads')
    }

    const book = Object.values(apollo).find(
      (entry): entry is GoodreadsApolloEntry =>
        typeof entry === 'object' &&
        entry !== null &&
        'details' in entry &&
        'primaryContributorEdge' in entry
    )

    if (!book) {
      return response.badRequest('Book not found on Goodreads')
    }

    const refs = [
      book.primaryContributorEdge?.node?.__ref,
      ...(book.secondaryContributorEdges ?? []).map(edge =>
        typeof edge.node === 'object' ? edge.node?.__ref : edge.node
      )
    ].filter((ref): ref is string => !!ref)

    const authors = refs
      .map(ref => (apollo[ref] as { name?: string } | undefined)?.name)
      .filter((name): name is string => !!name)

    const details = book.details ?? {}

    return response.ok({
      title: book.title ?? '',
      authors: authors.join(', '),
      publisher: details.publisher ?? '',
      year: details.publicationTime
        ? new Date(details.publicationTime).getFullYear()
        : 0,
      isbn: details.isbn13 || details.isbn || '',
      pageCount: details.numPages ?? 0,
      coverUrl: book.imageUrl ?? ''
    })
  })
