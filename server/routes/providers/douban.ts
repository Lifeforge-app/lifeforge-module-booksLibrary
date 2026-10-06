import z from 'zod'

import forge from '../../forge'

import type { ProviderBook, ProviderSearchResult } from './types'

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'

const PER_PAGE = 15

interface DoubanItem {
  tpl_name?: string
  id?: number
  title?: string
  abstract?: string
  cover_url?: string
  rating?: { value?: number }
  url?: string
}

function headers() {
  return {
    'User-Agent': USER_AGENT,
    Referer: 'https://book.douban.com/'
  }
}

function extractSearchData(html: string): { items?: DoubanItem[] } | null {
  const match = html.match(/window\.__DATA__\s*=\s*(\{[\s\S]*?\});/)

  if (!match) {
    return null
  }

  try {
    return JSON.parse(match[1])
  } catch {
    return null
  }
}

function parseAbstract(abstract: string) {
  const parts = abstract
    .split('/')
    .map(part => part.trim())
    .filter(Boolean)

  let authors = ''
  let publisher = ''
  let date = ''

  if (parts.length >= 4) {
    date = parts[parts.length - 2]
    publisher = parts[parts.length - 3]
    authors = parts.slice(0, -3).join(', ')
  } else if (parts.length === 3) {
    authors = parts[0]
    publisher = parts[1]
    date = parts[2]
  } else if (parts.length === 2) {
    authors = parts[0]
    publisher = parts[1]
  } else {
    authors = parts[0] ?? ''
  }

  const year = parseInt(date.match(/\d{4}/)?.[0] ?? '0', 10) || 0

  return { authors, publisher, year }
}

function parseInfo(html: string) {
  const block = html.match(/<div id="info"[\s\S]*?<\/div>/)?.[0] ?? ''

  const text = block
    .replace(/<br\s*\/?>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')

  const labels = [
    '作者',
    '出版社',
    '出版年',
    'ISBN',
    '页数',
    '装帧',
    '定价',
    '丛书',
    '副标题',
    '原作名',
    '译者',
    '出品方'
  ]

  const pattern = labels.join('|')

  const map: Record<string, string> = {}

  const regex = new RegExp(
    `(${pattern})\\s*[:：]\\s*([\\s\\S]*?)(?=\\s*(?:${pattern})\\s*[:：]|$)`,
    'g'
  )

  let match: RegExpExecArray | null

  while ((match = regex.exec(text))) {
    const key = match[1]
    const value = match[2].trim()

    if (value && !map[key]) {
      map[key] = value
    }
  }

  return map
}

export async function searchDouban(
  q: string,
  page: number
): Promise<ProviderSearchResult> {
  const parsedPage = Math.max(page || 1, 1)

  const url = new URL('https://book.douban.com/subject_search')

  url.searchParams.set('search_text', q)
  url.searchParams.set('cat', '1001')
  url.searchParams.set('start', String((parsedPage - 1) * PER_PAGE))

  const res = await fetch(url, {
    headers: headers(),
    signal: AbortSignal.timeout(10000)
  }).catch(() => null)

  if (!res?.ok) {
    throw new Error('Failed to reach Douban')
  }

  const data = extractSearchData(await res.text())

  if (!data) {
    throw new Error('Unexpected response from Douban')
  }

  const items = (data.items ?? []).filter(
    item => item.tpl_name === 'search_subject' && item.id && item.title
  )

  const results = items.map(
    (item): ProviderBook => {
      const { authors, publisher, year } = parseAbstract(item.abstract ?? '')

      return {
        key: String(item.id),
        title: item.title ?? '',
        authors,
        publisher,
        year,
        isbn: '',
        coverUrl: item.cover_url?.replace('/m/', '/l/') ?? '',
        pageCount: 0,
        languages: []
      }
    }
  )

  return {
    totalPages: results.length >= PER_PAGE ? parsedPage + 1 : parsedPage,
    results
  }
}

export const detail = forge
  .query({
    description: 'Get detailed book metadata from Douban by subject id',
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
    const res = await fetch(`https://book.douban.com/subject/${id}/`, {
      headers: headers(),
      signal: AbortSignal.timeout(10000)
    }).catch(() => null)

    if (!res?.ok) {
      return response.badRequest('Failed to reach Douban')
    }

    const html = await res.text()

    const info = parseInfo(html)

    const title =
      html
        .match(/<title>([\s\S]*?)<\/title>/)?.[1]
        .replace(/\s*\(豆瓣\)\s*$/, '')
        .trim() ?? ''

    const coverUrl =
      html.match(/<meta property="og:image" content="([^"]+)"/)?.[1] ?? ''

    return response.ok({
      title,
      authors: info['作者'] ?? '',
      publisher: info['出版社'] ?? '',
      year:
        parseInt((info['出版年'] ?? '').match(/\d{4}/)?.[0] ?? '0', 10) || 0,
      isbn: info['ISBN'] ?? '',
      pageCount:
        parseInt((info['页数'] ?? '').replace(/\D/g, '') || '0', 10) || 0,
      coverUrl
    })
  })

export const cover = forge
  .query({
    description: 'Proxy a Douban cover image',
    noAuth: true,
    encrypted: false,
    rateLimit: false,
    input: {
      query: z.object({ url: z.string() })
    },
    output: 'custom'
  })
  .callback(async ({ query: { url }, res }) => {
    let parsed: URL

    try {
      parsed = new URL(url)
    } catch {
      res.status(400).end()

      return
    }

    const hostname = parsed.hostname

    if (
      hostname !== 'doubanio.com' &&
      !hostname.endsWith('.doubanio.com') &&
      hostname !== 'douban.com' &&
      !hostname.endsWith('.douban.com')
    ) {
      res.status(400).end()

      return
    }

    let upstream: Response | null = null

    for (let attempt = 0; attempt < 3 && !upstream; attempt++) {
      upstream = await fetch(url, {
        headers: headers(),
        signal: AbortSignal.timeout(8000)
      }).catch(() => null)
    }

    if (!upstream?.ok) {
      res.status(502).end()

      return
    }

    res.setHeader(
      'Content-Type',
      upstream.headers.get('content-type') ?? 'image/jpeg'
    )
    res.setHeader('Cache-Control', 'public, max-age=86400')

    res.end(Buffer.from(await upstream.arrayBuffer()))
  })
