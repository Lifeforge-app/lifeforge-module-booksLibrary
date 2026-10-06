import type { InferOutput } from '@lifeforge/api'

import { forgeAPI } from '@/manifest'

export type BookSearchResults = InferOutput<typeof forgeAPI.providers.search>

export type BookSearchResult = BookSearchResults['results'][number]

export type Provider = BookSearchResult['source']

export type ProviderFilter = 'all' | Provider

export const PROVIDERS: {
  value: ProviderFilter
  text: string
  icon: string
  detail?: typeof forgeAPI.providers.douban.detail
}[] = [
  { value: 'all', text: 'All sources', icon: 'tabler:apps' },
  { value: 'openlibrary', text: 'Open Library', icon: 'tabler:book-2' },
  {
    value: 'goodreads',
    text: 'Goodreads',
    icon: 'fa-brands:goodreads',
    detail: forgeAPI.providers.goodreads.detail
  },
  {
    value: 'douban',
    text: '豆瓣',
    icon: 'ri:douban-fill',
    detail: forgeAPI.providers.douban.detail
  },
  {
    value: 'kingstone',
    text: '金石堂',
    icon: 'tabler:building-store',
    detail: forgeAPI.providers.kingstone.detail
  }
]
