import { useQuery } from '@tanstack/react-query'

import { useModuleTranslation } from '@lifeforge/localization'
import {
  Button,
  Flex,
  TagsFilter,
  Text,
  useModuleSidebarState
} from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'

import useFilter from '../hooks/useFilter'

function Header({ itemCount }: { itemCount: number }) {
  const { setIsSidebarOpen } = useModuleSidebarState()
  const { t } = useModuleTranslation()
  const collectionsQuery = useQuery(forgeAPI.collections.list.queryOptions())
  const languagesQuery = useQuery(forgeAPI.count.languages.queryOptions())
  const fileTypesQuery = useQuery(forgeAPI.count.fileTypes.queryOptions())
  const readStatusQuery = useQuery(forgeAPI.count.readStatus.queryOptions())
  const formatsQuery = useQuery(forgeAPI.formats.list.queryOptions())

  const {
    searchQuery,
    updateFilter,
    collection,
    favourite,
    fileType,
    language,
    format,
    readStatus
  } = useFilter()

  const isFiltered =
    !Object.values([
      collection,
      favourite,
      fileType,
      language,
      format,
      readStatus
    ]).every(value => !value) || !!searchQuery.trim()

  return (
    <Flex direction="column">
      <Flex justify="between">
        <Text as="h1" size="3xl" weight="semibold">
          {isFiltered ? 'Filtered' : 'All'} Books{' '}
          <Text as="span" color="muted" size="base">
            ({itemCount})
          </Text>
        </Text>
        <Button
          display={{ base: 'flex', lg: 'none' }}
          icon="tabler:menu"
          variant="plain"
          onClick={() => {
            setIsSidebarOpen(true)
          }}
        />
      </Flex>
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
          },
          format: {
            data:
              formatsQuery.data?.map(format => ({
                id: format.id,
                label: t(
                  `formats.${format.name === 'ebook' ? 'eBook' : 'physical'}`
                ),
                icon: format.icon
              })) ?? []
          },
          readStatus: {
            isColored: true,
            data:
              readStatusQuery.data?.map(status => ({
                id: status.id,
                label: t(`sidebar.${status.name}`),
                icon: status.icon,
                color: status.color
              })) ?? []
          }
        }}
        mt="sm"
        values={{
          collection,
          fileType,
          language,
          format,
          readStatus
        }}
        onChange={{
          collection: value => updateFilter('collection', value || null),
          fileType: value => updateFilter('fileType', value || null),
          language: value => updateFilter('language', value || null),
          format: value => updateFilter('format', value || null),
          readStatus: value => updateFilter('readStatus', value || null)
        }}
      />
    </Flex>
  )
}

export default Header
