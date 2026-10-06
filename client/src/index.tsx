import { useQuery } from '@tanstack/react-query'

import type { InferOutput } from '@lifeforge/api'
import {
  ContentWrapperWithSidebar,
  ContextMenu,
  Flex,
  LayoutWithSidebar,
  ModuleHeader,
  SearchInput
} from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'

import BookCreationMenu from './components/BookCreationMenu'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import useFilter from './hooks/useFilter'
import BookListing, { ViewMode } from './views'

export type BooksLibraryEntry = InferOutput<
  typeof forgeAPI.entries.list
>['items'][number]

export type BooksLibraryCollection = InferOutput<
  typeof forgeAPI.collections.list
>[number]

export type BooksLibraryLanguage = InferOutput<
  typeof forgeAPI.count.languages
>[number]

export type BooksLibraryFileType = InferOutput<
  typeof forgeAPI.count.fileTypes
>[number]

export type BooksLibraryFormat = InferOutput<
  typeof forgeAPI.formats.list
>[number]

function BooksLibrary() {
  const {
    page,
    collection,
    language,
    favourite,
    fileType,
    readStatus,
    format,
    searchQuery,
    setSearchQuery
  } = useFilter()

  const dataQuery = useQuery(
    forgeAPI.entries.list
      .input({
        page: page.toString(),
        collection: collection || undefined,
        language: language || undefined,
        favourite: favourite.toString() as 'true' | 'false',
        fileType: fileType || undefined,
        readStatus: readStatus || undefined,
        format: format || undefined,
        query: searchQuery.trim() || undefined
      })
      .queryOptions()
  )

  return (
    <ViewMode.Root>
      <ModuleHeader
        trailing={
          <>
            <BookCreationMenu variant="desktop" />
            <ContextMenu display={{ base: 'block', md: 'none' }}>
              <ViewMode.ContextMenuSelector />
            </ContextMenu>
          </>
        }
      />
      <LayoutWithSidebar>
        <Sidebar />
        <ContentWrapperWithSidebar>
          <Header itemCount={dataQuery.data?.totalItems || 0} />
          <Flex align="center" gap="xs" mt="md">
            <SearchInput
              debounceMs={300}
              searchTarget="book"
              value={searchQuery}
              onChange={setSearchQuery}
            />
            <ViewMode.Selector />
          </Flex>
          <BookListing />
        </ContentWrapperWithSidebar>
      </LayoutWithSidebar>
      <BookCreationMenu variant="mobile" />
    </ViewMode.Root>
  )
}

export default BooksLibrary
