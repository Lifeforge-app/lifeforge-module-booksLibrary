import { useQuery } from '@tanstack/react-query'

import { SidebarDivider, SidebarItem, SidebarWrapper } from '@lifeforge/ui'

import useFilter from '@/hooks/useFilter'
import { forgeAPI } from '@/manifest'

import SidebarSection from './components/SidebarSection'

function Sidebar() {
  const {
    updateFilter,
    collection,
    favourite,
    fileType,
    language,
    format,
    readStatus
  } = useFilter()

  const collectionsQuery = useQuery(forgeAPI.collections.list.queryOptions())
  const languagesQuery = useQuery(forgeAPI.count.languages.queryOptions())
  const fileTypesQuery = useQuery(forgeAPI.count.fileTypes.queryOptions())
  const readStatusQuery = useQuery(forgeAPI.count.readStatus.queryOptions())
  const formatsQuery = useQuery(forgeAPI.formats.list.queryOptions())

  return (
    <SidebarWrapper>
      <SidebarItem
        active={Object.values([
          collection,
          favourite,
          fileType,
          language,
          format,
          readStatus
        ]).every(value => !value)}
        icon="tabler:list"
        label="All books"
        onClick={() => {
          updateFilter('collection', null)
          updateFilter('fileType', null)
          updateFilter('language', null)
          updateFilter('favourite', false)
          updateFilter('format', null)
          updateFilter('readStatus', null)
        }}
      />
      <SidebarItem
        active={favourite}
        icon="tabler:heart"
        label="Favourite"
        onCancelButtonClick={() => {
          updateFilter('favourite', false)
        }}
        onClick={() => {
          updateFilter('favourite', true)
        }}
      />
      <SidebarDivider />
      <SidebarSection
        useNamespace
        dataQuery={formatsQuery}
        fallbackIcon="tabler:book"
        hasActionButton={false}
        hasContextMenu={false}
        stuff="formats"
      />
      <SidebarDivider />
      <SidebarSection
        useNamespace
        dataQuery={readStatusQuery}
        fallbackIcon="tabler:book"
        hasActionButton={false}
        hasContextMenu={false}
        stuff="readStatus"
      />
      <SidebarDivider />
      <SidebarSection dataQuery={collectionsQuery} stuff="collections" />
      <SidebarDivider />
      <SidebarSection dataQuery={languagesQuery} stuff="languages" />
      <SidebarDivider />
      <SidebarSection
        dataQuery={fileTypesQuery}
        fallbackIcon="tabler:file-text"
        hasActionButton={false}
        hasContextMenu={false}
        stuff="fileTypes"
      />
    </SidebarWrapper>
  )
}

export default Sidebar
