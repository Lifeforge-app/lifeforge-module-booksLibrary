import { Box, Flex, Pagination, Stack, Text } from '@lifeforge/ui'

import type { AnnasSearchResult } from '..'
import SearchResultItem from './SearchResultItem'

function SearchResultList({
  data,
  currentPage,
  onPageChange
}: {
  data: AnnasSearchResult
  currentPage: number
  onPageChange: (page: number) => void
}) {
  return (
    <Flex direction="column" gap="xs">
      <Box mb="md">
        <Text color="muted" size="lg" weight="medium">
          Search results for{' '}
          <Text as="span" color={{ base: 'bg-800', dark: 'bg-100' }}>
            &quot;{data.query}&quot;
          </Text>
        </Text>
        <Text color="muted" size="sm">
          {data.total} result
          {data.total !== 1 ? 's' : ''} found on page {currentPage} of{' '}
          {data.totalPages}
        </Text>
      </Box>
      <Pagination
        mb="md"
        page={currentPage}
        totalPages={data.totalPages || 1}
        onPageChange={onPageChange}
      />
      <Stack gap="sm">
        {data.results.map(book => (
          <SearchResultItem key={book.md5} book={book} />
        ))}
      </Stack>
      <Pagination
        mt="md"
        page={currentPage}
        totalPages={data.totalPages || 1}
        onPageChange={onPageChange}
      />
    </Flex>
  )
}

export default SearchResultList