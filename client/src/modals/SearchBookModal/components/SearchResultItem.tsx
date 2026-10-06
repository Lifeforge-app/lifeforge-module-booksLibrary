import { Fragment } from 'react'

import { usePromiseLoading } from '@lifeforge/api'
import { Box, Button, Card, Flex, Icon, Text, surface } from '@lifeforge/ui'

import { MetaItem, Separator } from '@/components/MetaItem'
import { forgeAPI } from '@/manifest'

import { PROVIDERS, type BookSearchResult } from '../providers'

function SearchResultItem({
  data,
  isAdded,
  onAdd
}: {
  data: BookSearchResult
  isAdded: boolean
  onAdd: (result: BookSearchResult) => Promise<void>
}) {
  const [loading, handleAdd] = usePromiseLoading(() => onAdd(data))

  const providerLabel = PROVIDERS.find(item => item.value === data.source)?.text

  const coverSrc = data.coverUrl
    ? data.source === 'douban'
      ? forgeAPI.providers.douban.cover.input({
          url: data.coverUrl.replace('/l/', '/m/')
        }).endpoint
      : data.coverUrl
    : ''

  const metaItems: {
    key: string
    icon: string
    label: React.ReactNode
  }[] = [
    data.year !== 0 && {
      key: 'year',
      icon: 'tabler:clock',
      label: data.year
    },
    data.publisher !== '' && {
      key: 'publisher',
      icon: 'tabler:building',
      label: data.publisher
    },
    data.isbn !== '' && {
      key: 'isbn',
      icon: 'tabler:barcode',
      label: `ISBN: ${data.isbn}`
    }
  ].filter((meta): meta is Exclude<typeof meta, false> => Boolean(meta))

  return (
    <Card bg={surface.light} direction={{ base: 'column', sm: 'row' }} gap="md">
      <Box
        bg={{ base: 'bg-200', dark: 'bg-800' }}
        height="11rem"
        overflow="hidden"
        position="relative"
        r="md"
        style={{ isolation: 'isolate', width: '7rem', flexShrink: 0 }}
      >
        <Icon
          color={{ base: 'bg-300', dark: 'bg-700' }}
          icon="tabler:book"
          size="3.5em"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: -1
          }}
        />
        {coverSrc !== '' && (
          <img
            alt=""
            loading="lazy"
            src={coverSrc}
            style={{ height: '100%', width: '100%', objectFit: 'cover' }}
          />
        )}
      </Box>
      <Flex direction="column" flex="1" minWidth="0">
        <Text color="muted">{providerLabel}</Text>
        <Text as="h1" lineClamp={2} mt="xs" size="xl" weight="semibold">
          {data.title}
        </Text>
        {data.authors !== '' && (
          <Text color="custom-500" lineClamp={2} mt="xs">
            {data.authors}
          </Text>
        )}
        <Flex
          align="center"
          gap="xs"
          minWidth="0"
          mt="md"
          width="100%"
          wrap="wrap"
        >
          {metaItems.map((item, index) => (
            <Fragment key={item.key}>
              <MetaItem icon={item.icon}>{item.label}</MetaItem>
              {index !== metaItems.length - 1 && <Separator />}
            </Fragment>
          ))}
        </Flex>
        <Flex align="end" flex="1">
          <Button
            disabled={isAdded || loading}
            icon={isAdded ? 'tabler:check' : 'tabler:plus'}
            loading={loading}
            mt="md"
            variant={isAdded ? 'plain' : 'primary'}
            width="100%"
            onClick={handleAdd}
          >
            {isAdded ? 'Already in Library' : 'Add to Library'}
          </Button>
        </Flex>
      </Flex>
    </Card>
  )
}

export default SearchResultItem
