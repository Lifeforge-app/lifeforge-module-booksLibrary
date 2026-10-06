import { Box, EmptyStateScreen, Pagination, Stack } from '@lifeforge/ui'

import type { BookSearchResult, BookSearchResults } from '..'
import SearchResultItem from './SearchResultItem'

function SearchResultsList({
  results,
  page,
  setPage,
  onAdd
}: {
  results: BookSearchResults
  page: number
  setPage: React.Dispatch<React.SetStateAction<number>>
  onAdd: (result: BookSearchResult) => Promise<void>
}) {
  if (results.totalItems === 0) {
    return (
      <Box height="24rem" mt="lg">
        <EmptyStateScreen
          icon="tabler:search-off"
          message={{ id: 'result' }}
        />
      </Box>
    )
  }

  return (
    <>
      <Pagination
        mb="md"
        mt="lg"
        page={page}
        totalPages={results.totalPages}
        onPageChange={setPage}
      />
      <Stack gap="xs" mt="lg">
        {results.results.map(entry => (
          <SearchResultItem
            key={`${entry.source}:${entry.key}`}
            data={entry}
            isAdded={entry.existed}
            onAdd={onAdd}
          />
        ))}
      </Stack>
      <Pagination
        mt="md"
        page={page}
        totalPages={results.totalPages}
        onPageChange={setPage}
      />
    </>
  )
}

export default SearchResultsList
