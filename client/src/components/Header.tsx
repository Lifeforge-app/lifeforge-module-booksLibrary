import { useQuery } from '@tanstack/react-query'
import { Button, TagsFilter, useModuleSidebarState } from 'lifeforge-ui'

import forgeAPI from '@/utils/forgeAPI'

import useFilter from '../hooks/useFilter'

function Header({ itemCount }: { itemCount: number }) {
  const { setIsSidebarOpen } = useModuleSidebarState()

  const collectionsQuery = useQuery(forgeAPI.collections.list.queryOptions())

  const languagesQuery = useQuery(forgeAPI.languages.list.queryOptions())

  const fileTypesQuery = useQuery(forgeAPI.fileTypes.list.queryOptions())

  const {
    searchQuery,
    updateFilter,
    collection,
    favourite,
    fileType,
    language,
    readStatus
  } = useFilter()

  return (
    <div>
      <div className="flex-between flex">
        <h1 className="text-3xl font-semibold">
          {Object.values([
            collection,
            favourite,
            fileType,
            language,
            readStatus
          ]).every(value => !value) && !searchQuery.trim()
            ? 'All'
            : 'Filtered'}{' '}
          Books <span className="text-bg-500 text-base">({itemCount})</span>
        </h1>
        <Button
          className="lg:hidden"
          icon="tabler:menu"
          variant="plain"
          onClick={() => {
            setIsSidebarOpen(true)
          }}
        />
      </div>
      <TagsFilter
        availableFilters={{
          collection: {
            data:
              collectionsQuery.data?.map(collection => ({
                id: collection.id,
                label: collection.name,
                icon: 'tabler:books'
              })) ?? []
          },
          fileType: {
            data:
              fileTypesQuery.data?.map(e => ({
                id: e.id,
                label: e.name,
                icon: 'tabler:file-text'
              })) ?? []
          },
          language: {
            data:
              languagesQuery.data?.map(language => ({
                id: language.id,
                label: language.name,
                icon: 'tabler:language'
              })) ?? []
          }
        }}
        values={{
          collection: collection ?? '',
          fileType: fileType ?? '',
          language: language ?? ''
        }}
        onChange={{
          collection: value =>
            updateFilter('collection', (value || null) as string | null),
          fileType: value =>
            updateFilter('fileType', (value || null) as string | null),
          language: value =>
            updateFilter('language', (value || null) as string | null)
        }}
      />
    </div>
  )
}

export default Header
