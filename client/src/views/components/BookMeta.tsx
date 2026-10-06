import type { BooksLibraryEntry } from '@'
import { Fragment } from 'react'
import { useQuery } from '@tanstack/react-query'
import humanNumber from 'human-number'
import prettyBytes from 'pretty-bytes'

import { useModuleTranslation } from '@lifeforge/localization'
import { Flex } from '@lifeforge/ui'

import { MetaItem, Separator } from '@/components/MetaItem'
import { forgeAPI } from '@/manifest'

function BookMeta({
  item,
  isGridView = false
}: {
  item: BooksLibraryEntry
  isGridView?: boolean
}) {
  const { t } = useModuleTranslation()
  const languagesQuery = useQuery(forgeAPI.count.languages.queryOptions())

  const langs = (languagesQuery.data ?? []).filter(language =>
    item.languages?.includes(language.id)
  )

  const metaItems: {
    key: string
    icon: string
    label: React.ReactNode
    truncate?: boolean
  }[] = [
    item.page_count !== 0 && {
      key: 'pages',
      icon: 'tabler:file-text',
      label: `${humanNumber(item.page_count)} pages`
    },
    item.word_count !== 0 && {
      key: 'words',
      icon: 'tabler:text-size',
      label: `${humanNumber(item.word_count)} words`
    },
    ...langs.map(lang => ({
      key: `lang:${lang.id}`,
      icon: lang.icon,
      label: lang.name
    })),
    item.year_published !== 0 && {
      key: 'year',
      icon: 'tabler:clock',
      label: item.year_published
    },
    item.publisher !== '' && {
      key: 'publisher',
      icon: 'tabler:user',
      label: item.publisher,
      truncate: true
    },
    ...item.formats.map(format => ({
      key: `format:${format}`,
      icon: format === 'physical' ? 'tabler:book' : 'tabler:device-tablet',
      label: t(`formats.${format === 'physical' ? 'physical' : 'eBook'}`)
    })),
    item.size > 0 && {
      key: 'size',
      icon: 'tabler:dimensions',
      label: prettyBytes(item.size)
    },
    item.extension !== '' && {
      key: 'extension',
      icon: 'tabler:file-text',
      label: item.extension
    }
  ].filter(
    (meta): meta is Exclude<typeof meta, false> => Boolean(meta)
  )

  return (
    <Flex align="center" gap="xs" minWidth="0" mt="md" width="100%" wrap="wrap">
      {metaItems.map((meta, index) => (
        <Fragment key={meta.key}>
          <MetaItem icon={meta.icon} truncate={meta.truncate}>
            {meta.label}
          </MetaItem>
          {index !== metaItems.length - 1 && (
            <Separator isGridView={isGridView} />
          )}
        </Fragment>
      ))}
    </Flex>
  )
}

export default BookMeta
