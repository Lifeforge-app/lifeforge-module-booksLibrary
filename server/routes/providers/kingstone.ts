import z from 'zod'

import forge from '../../forge'

import type { ProviderBook, ProviderSearchResult } from './types'

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'

const PER_PAGE = 48

const headers = () => ({ 'User-Agent': USER_AGENT })

function stripTags(html: string) {
  return html
    .replace(/<br\s*\/?>/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x9;/g, ' ')
    .replace(/&#xA;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function toText(html: string) {
  return stripTags(
    html.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ')
  )
}

export async function searchKingstone(
  q: string,
  page: number
): Promise<ProviderSearchResult> {
  const parsedPage = Math.max(page || 1, 1)

  const url = `https://www.kingstone.com.tw/search/key/${encodeURIComponent(
    q
  )}${parsedPage > 1 ? `?page=${parsedPage}` : ''}`

  const res = await fetch(url, {
    headers: headers(),
    signal: AbortSignal.timeout(10000)
  }).catch(() => null)

  if (!res?.ok) {
    throw new Error('Failed to reach Kingstone')
  }

  const html = await res.text()

  const blocks = html.match(/<li class="displayunit">[\s\S]*?<\/li>/g) ?? []

  const results = blocks
    .map((block): ProviderBook | null => {
      const id = block.match(/\/basic\/(\d+)\//)?.[1]

      if (!id) {
        return null
      }

      const title = block.match(
        /<h3 class="pdnamebox">[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/
      )?.[1]

      const coverUrl =
        block.match(
          /src="(https:\/\/cdn\.kingstone\.com\.tw\/book\/images\/product\/[^"]+)"/
        )?.[1] ?? ''

      const authors = block.match(
        /<span class="author">[\s\S]*?<a[^>]*>([^<]+)<\/a>/
      )?.[1]

      const publisher = block.match(
        /<span class="publish">[\s\S]*?<a[^>]*>([^<]+)<\/a>/
      )?.[1]

      return {
        key: id,
        title: stripTags(title ?? ''),
        authors: stripTags(authors ?? ''),
        publisher: stripTags(publisher ?? ''),
        year: 0,
        isbn: '',
        coverUrl,
        pageCount: 0,
        languages: []
      }
    })
    .filter((item): item is ProviderBook => item !== null)

  return {
    totalPages: results.length >= PER_PAGE ? parsedPage + 1 : parsedPage,
    results
  }
}

export const detail = forge
  .query({
    description: 'Get detailed book metadata from Kingstone by product id',
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
    const res = await fetch(`https://www.kingstone.com.tw/basic/${id}/`, {
      headers: headers(),
      signal: AbortSignal.timeout(10000)
    }).catch(() => null)

    if (!res?.ok) {
      return response.badRequest('Failed to reach Kingstone')
    }

    const html = await res.text()

    const text = toText(html)

    const isbn =
      text.match(/ISBN\s*([\dXx-]{10,17})/)?.[1].replace(/-/g, '') ?? ''

    const title = (
      html.match(/<meta property="og:title" content="([^"]+)"/)?.[1] ?? ''
    )
      .replace(/[\s－-]*金石堂\s*$/, '')
      .trim()

    return response.ok({
      title,
      authors: text.match(/作者：\s*([^\s追]+)/)?.[1] ?? '',
      publisher: text.match(/出版社：\s*([^\s追]+)/)?.[1] ?? '',
      year:
        parseInt(text.match(/出版日：\s*(\d{4})/)?.[1] ?? '0', 10) || 0,
      isbn,
      pageCount: parseInt(text.match(/頁數\s*(\d+)/)?.[1] ?? '0', 10) || 0,
      coverUrl:
        html.match(/<meta property="og:image" content="([^"]+)"/)?.[1] ?? ''
    })
  })
