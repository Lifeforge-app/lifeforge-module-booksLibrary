import { Box, Flex, Icon, Text } from '@lifeforge/ui'

export function Separator({ isGridView }: { isGridView?: boolean }) {
  return (
    <Icon
      color="muted"
      display={{ base: isGridView ? 'none' : 'block', sm: 'block' }}
      icon="tabler:circle-filled"
      mx="xs"
      size="0.25em"
    />
  )
}

export function MetaItem({
  icon,
  children,
  truncate = false
}: {
  icon: string
  children: React.ReactNode
  truncate?: boolean
}) {
  return (
    <Flex align="center" flexShrink="0" style={{ whiteSpace: 'nowrap' }}>
      <Icon color="muted" icon={icon} mr="xs" size="1em" />
      {truncate ? (
        <Box asChild maxWidth={{ base: '11rem', sm: '12rem' }} minWidth="0">
          <Text truncate color="muted">
            {children}
          </Text>
        </Box>
      ) : (
        <Text color="muted">{children}</Text>
      )}
    </Flex>
  )
}
