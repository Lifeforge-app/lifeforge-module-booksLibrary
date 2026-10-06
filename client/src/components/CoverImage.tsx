import { Box, Flex, type FlexProps, Icon, surface } from '@lifeforge/ui'

function CoverImage({ src, ...props }: { src: string } & FlexProps) {
  return (
    <Flex
      centered
      aspectRatio="148 / 210"
      bg={surface.light}
      height="min-content"
      overflow="hidden"
      p="sm"
      position="relative"
      r="lg"
      width="12em"
      {...props}
      style={{ isolation: 'isolate', ...props.style }}
    >
      <img
        alt=""
        loading="lazy"
        src={src}
        style={{ height: '100%', objectFit: 'cover' }}
      />
      <Box
        asChild
        left="50%"
        position="absolute"
        style={{ transform: 'translate(-50%, -50%)' }}
        top="50%"
        zIndex="-1"
      >
        <Icon
          color={{ base: 'bg-200', dark: 'bg-700' }}
          icon="tabler:book"
          size="3em"
        />
      </Box>
    </Flex>
  )
}

export default CoverImage
