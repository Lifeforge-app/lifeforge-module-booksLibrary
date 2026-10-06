import { useQuery } from '@tanstack/react-query'

import {
  Box,
  Card,
  EmptyStateScreen,
  Grid,
  ModalHeader,
  WithQuery
} from '@lifeforge/ui'

import CoverImage from '@/components/CoverImage'
import { forgeAPI } from '@/manifest'

function CoverPickerModal({
  data: { key, isbn, title, onSelect },
  onClose
}: {
  data: {
    key?: string
    isbn?: string
    title?: string
    onSelect: (url: string) => void
  }
  onClose: () => void
}) {
  const coversQuery = useQuery(
    forgeAPI.providers.openLibrary.covers
      .input({ key, isbn, title })
      .queryOptions({ enabled: Boolean(key || isbn || title) })
  )

  return (
    <Box maxWidth="60rem" minWidth="60vw">
      <ModalHeader icon="tabler:photo" title="book.covers" onClose={onClose} />
      <WithQuery query={coversQuery}>
        {({ covers }) =>
          covers.length > 0 ? (
            <Grid
              gap="sm"
              maxHeight="60vh"
              overflowY="auto"
              pr="sm"
              templateCols={{ base: 2, sm: 3, md: 4, lg: 5 }}
            >
              {covers.map(id => (
                <Card
                  key={id}
                  isInteractive
                  overflow="hidden"
                  p="none"
                  r="md"
                  onClick={() => {
                    onSelect(`https://covers.openlibrary.org/b/id/${id}-L.jpg`)
                    onClose()
                  }}
                >
                  <CoverImage
                    aspectRatio="148 / 210"
                    src={`https://covers.openlibrary.org/b/id/${id}-M.jpg`}
                    width="100%"
                  />
                </Card>
              ))}
            </Grid>
          ) : (
            <Box height="24rem">
              <EmptyStateScreen
                icon="tabler:photo-off"
                message={{ id: 'covers' }}
              />
            </Box>
          )
        }
      </WithQuery>
    </Box>
  )
}

export default CoverPickerModal
