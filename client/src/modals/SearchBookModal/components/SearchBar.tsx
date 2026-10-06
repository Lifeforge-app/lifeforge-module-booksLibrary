import { useState } from 'react'

import {
  Button,
  Flex,
  Icon,
  Listbox,
  ListboxOption,
  QRCodeScanner,
  SearchInput,
  Text,
  surface,
  useModalStore
} from '@lifeforge/ui'

import { PROVIDERS, type ProviderFilter } from '../providers'

function SearchBar({
  provider,
  loading,
  onProviderChange,
  onSearch
}: {
  provider: ProviderFilter
  loading: boolean
  onProviderChange: (provider: ProviderFilter) => void
  onSearch: (query: string) => void
}) {
  const { open } = useModalStore()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = () => {
    if (searchQuery.trim() === '') {
      return
    }

    onSearch(searchQuery.trim())
  }

  const scanIsbn = () => {
    open(QRCodeScanner, {
      formats: ['linear_codes'],
      onScanned: (data: string) => {
        const isbn = data.trim()

        setSearchQuery(isbn)
        onSearch(isbn)
      }
    })
  }

  return (
    <Flex align="center" direction={{ base: 'column', sm: 'row' }} gap="xs">
      <Listbox
        minWidth="12rem"
        renderContent={value => {
          const option = PROVIDERS.find(item => item.value === value)

          return (
            <Flex align="center" gap="sm">
              <Icon icon={option?.icon ?? 'tabler:apps'} />
              <Text truncate>{option?.text}</Text>
            </Flex>
          )
        }}
        value={provider}
        width={{ base: '100%', sm: 'auto' }}
        onChange={onProviderChange}
      >
        {PROVIDERS.map(option => (
          <ListboxOption
            key={option.value}
            icon={option.icon}
            label={option.text}
            value={option.value}
          />
        ))}
      </Listbox>
      <SearchInput
        actionButtonProps={{
          icon: 'tabler:scan',
          onClick: scanIsbn
        }}
        bg={surface.lightInteractive}
        searchTarget="book"
        value={searchQuery}
        onChange={setSearchQuery}
        onKeyUp={e => {
          if (e.key === 'Enter') {
            handleSearch()
          }
        }}
      />
      <Button
        disabled={searchQuery.trim() === ''}
        icon="tabler:arrow-right"
        iconPosition="end"
        loading={loading}
        width={{ base: '100%', sm: 'auto' }}
        onClick={handleSearch}
      >
        search
      </Button>
    </Flex>
  )
}

export default SearchBar
