import type { BooksLibraryEntry } from '@'
import { useQuery } from '@tanstack/react-query'

import {
  Box,
  Card,
  ContextMenu,
  Flex,
  Icon,
  Text
} from '@lifeforge/ui'

import CoverImage from '@/components/CoverImage'
import { forgeAPI } from '@/manifest'

import BookMeta from '../../components/BookMeta'
import EntryContextMenu from '../../components/EntryContextMenu'
import ReadStatusChip from '../../components/ReadStatusChip'

export default function EntryItem({ item }: { item: BooksLibraryEntry }) {
  const collectionsQuery = useQuery(forgeAPI.collections.list.queryOptions())

  return (
    <Card as="li" direction={{ base: 'column', sm: 'row' }} gap="md">
      <Box position="absolute" right="1em" top="1em" zIndex="20">
        <ContextMenu>
          <EntryContextMenu item={item} />
        </ContextMenu>
      </Box>
      <CoverImage
        src={forgeAPI.getMedia({
          key: item.thumbnail,
          thumb: '200x0'
        })}
      />
      <Flex direction="column" flex="1" minWidth="0" width="100%">
        <ReadStatusChip item={item} />
        {collectionsQuery.data &&
          (() => {
            const collection = collectionsQuery.data.find(
              collection => collection.id === item.collection
            )

            return collection !== undefined ? (
              <Flex align="center" gap="xs" mb="md">
                <Icon color="muted" icon={collection.icon} />
                <Text color="muted" weight="medium">
                  {collection.name}
                </Text>
              </Flex>
            ) : null
          })()}
        <Text
          lineClamp={3}
          size="xl"
          style={{ marginRight: '7rem' }}
          weight="semibold"
        >
          {item.title}{' '}
          {item.edition !== '' && (
            <Text as="span" color="muted" size="sm">
              ({item.edition} ed)
            </Text>
          )}
        </Text>
        <Text
          color="custom-500"
          mt="xs"
          style={{ marginRight: '7rem' }}
          weight="medium"
        >
          {item.authors}
        </Text>
        <BookMeta item={item} />
      </Flex>
    </Card>
  )
}
