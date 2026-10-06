import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import {
  Box,
  EmptyStateScreen,
  ModalHeader,
  WithQuery,
  useModalStore
} from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'

import ModifyBookModal from '../ModifyBookModal'
import SearchBar from './components/SearchBar'
import SearchResultsList from './components/SearchResultsList'
import {
  PROVIDERS,
  type BookSearchResult,
  type ProviderFilter
} from './providers'

export type { BookSearchResult, BookSearchResults } from './providers'

function SearchBookModal({ onClose }: { onClose: () => void }) {
  const { open } = useModalStore()
  const [queryToSearch, setQueryToSearch] = useState('')
  const [provider, setProvider] = useState<ProviderFilter>('all')
  const [page, setPage] = useState(1)

  const searchResultsQuery = useQuery(
    forgeAPI.providers.search
      .input({
        q: queryToSearch,
        page: page.toString(),
        provider: provider === 'all' ? undefined : provider
      })
      .queryOptions({ enabled: !!queryToSearch })
  )

  const handleAdd = async (result: BookSearchResult) => {
    const source = result.source

    const isbnFromQuery = /^\d{9,13}[\dXx]?$/.test(queryToSearch.trim())
      ? queryToSearch.trim()
      : ''

    const isbn = result.isbn || isbnFromQuery

    const detail = await PROVIDERS.find(item => item.value === source)?.detail
      ?.input({ id: result.key })
      .query()
      .catch(() => null)

    open(ModifyBookModal, {
      initialData: {
        title: detail?.title || result.title,
        authors: detail?.authors || result.authors,
        publisher: detail?.publisher || result.publisher,
        year_published: detail?.year || result.year,
        page_count: detail?.pageCount || result.pageCount,
        isbn: detail?.isbn || isbn,
        thumbnailUrl: detail?.coverUrl || result.coverUrl || undefined,
        formats: ['physical']
      },
      detectedLanguages: result.languages
    })
  }

  return (
    <Box minWidth="70vw">
      <ModalHeader
        icon="tabler:book-2"
        subtitle="Open Library · Goodreads · 豆瓣 · 金石堂"
        title="book.search"
        onClose={onClose}
      />
      <SearchBar
        loading={searchResultsQuery.isLoading}
        provider={provider}
        onProviderChange={setProvider}
        onSearch={query => {
          setPage(1)
          setQueryToSearch(query)
        }}
      />
      <Box mt="lg">
        {queryToSearch ? (
          <WithQuery query={searchResultsQuery}>
            {results => (
              <SearchResultsList
                page={page}
                results={results}
                setPage={setPage}
                onAdd={handleAdd}
              />
            )}
          </WithQuery>
        ) : (
          <Box height="24rem">
            <EmptyStateScreen
              icon="tabler:book-2"
              message={{ id: 'searchBook' }}
            />
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default SearchBookModal
