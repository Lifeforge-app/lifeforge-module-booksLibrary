import { Icon } from '@iconify/react'
import clsx from 'clsx'
import {
  Button,
  EmptyStateScreen,
  Listbox,
  ListboxOption,
  LoadingScreen,
  ModalHeader,
  Pagination,
  QRCodeScanner,
  Scrollbar,
  SearchInput,
  useModalStore
} from 'lifeforge-ui'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { type InferOutput, usePromiseLoading } from 'shared'

import forgeAPI from '@/utils/forgeAPI'

import Details from './components/Details'
import SearchResultItem from './components/SearchResultItem'

const PROVIDERS = [
  'libgen.is',
  'libgen.li',
  'libgen.gs',
  'libgen.vg',
  'libgen.pg',
  'libgen.gl'
] as const

export type LibgenSearchResult = InferOutput<typeof forgeAPI.libgen.searchBooks>

function LibgenModal({ onClose }: { onClose: () => void }) {
  const { open } = useModalStore()

  const [provider, setProvider] =
    useState<(typeof PROVIDERS)[number]>('libgen.is')

  const [searchQuery, setSearchQuery] = useState('')

  const [hasSearched, setHasSearched] = useState(false)

  const [data, setData] = useState<LibgenSearchResult | null>(null)

  const [totalPages, setTotalPages] = useState(0)

  const [viewDetailsFor, setViewDetailsFor] = useState<string | null>(null)

  const [providerOnlineStatuses, setProviderOnlineStatuses] = useState<
    Record<(typeof PROVIDERS)[number], boolean | 'loading'>
  >(() =>
    PROVIDERS.reduce(
      (acc, endpoint) => ({ ...acc, [endpoint]: 'loading' }),
      {} as Record<(typeof PROVIDERS)[number], boolean | 'loading'>
    )
  )

  async function checkLibgenOnlineStatus() {
    const promises = PROVIDERS.map(async endpoint => {
      try {
        await forgeAPI
          .corsAnywhere(`https://${endpoint}`)
          .queryRaw({ timeout: 5000 })

        return { endpoint, ok: true }
      } catch {
        return { endpoint, ok: false }
      }
    })

    const results = await Promise.all(promises)

    const statusMap = results.reduce(
      (acc, { endpoint, ok }) => {
        acc[endpoint] = ok

        return acc
      },
      {} as Record<(typeof PROVIDERS)[number], boolean>
    )

    setProviderOnlineStatuses(prev => ({
      ...prev,
      ...statusMap
    }))
  }

  async function fetchBookResults(page = 1) {
    if (
      loading ||
      providerOnlineStatuses[provider] === 'loading' ||
      !providerOnlineStatuses[provider]
    ) {
      return
    }

    if (searchQuery.trim() === '') {
      toast.error('Please enter a search query')

      return
    }

    setHasSearched(true)

    try {
      const response = await forgeAPI.libgen.searchBooks
        .input({
          provider,
          req: searchQuery.trim(),
          page: page.toString()
        })
        .query()

      setData(response.data.length === 0 ? null : response)
      setTotalPages(Math.ceil(parseInt(response.resultsCount) / 25))
    } catch {
      toast.error('Failed to fetch search results')
      setData(null)
    }
  }

  const [loading, triggerFetch] = usePromiseLoading(fetchBookResults)

  useEffect(() => {
    setProviderOnlineStatuses(() =>
      PROVIDERS.reduce(
        (acc, endpoint) => ({ ...acc, [endpoint]: 'loading' }),
        {} as Record<(typeof PROVIDERS)[number], boolean | 'loading'>
      )
    )
    checkLibgenOnlineStatus()
    setHasSearched(false)
    setSearchQuery('')
  }, [])

  return (
    <div className="flex min-h-[80vh] min-w-[70vw] flex-col">
      <ModalHeader
        icon="tabler:books"
        namespace="apps.booksLibrary"
        title="Library Genesis"
        onClose={onClose}
      />
      {viewDetailsFor !== null ? (
        <Details
          md5={viewDetailsFor}
          provider={provider}
          onClose={() => {
            setViewDetailsFor(null)
          }}
        />
      ) : (
        <>
          <div className="flex flex-col items-center gap-2 sm:flex-row">
            <Listbox
              buttonContent={
                <div className="flex w-56 items-center gap-2">
                  {(() => {
                    if (providerOnlineStatuses[provider] === 'loading') {
                      return (
                        <Icon
                          className="text-bg-500 size-5"
                          icon="svg-spinners:ring-resize"
                        />
                      )
                    }

                    return (
                      <span
                        className={clsx(
                          'inline-block size-3 rounded-full',
                          providerOnlineStatuses[provider]
                            ? 'bg-green-500'
                            : 'bg-red-500'
                        )}
                      />
                    )
                  })()}
                  <span className="font-medium whitespace-nowrap">
                    {PROVIDERS.find(value => value === provider) ?? 'Unknown'}
                  </span>
                </div>
              }
              className="relative w-full sm:w-auto"
              value={provider}
              onChange={value => {
                setProvider(value)
              }}
            >
              {PROVIDERS.map(value => (
                <ListboxOption
                  key={value}
                  color={(() => {
                    if (providerOnlineStatuses[value] === 'loading') {
                      return 'oklch(70.8% 0 0)'
                    }

                    return providerOnlineStatuses[value]
                      ? 'oklch(79.2% 0.209 151.711)'
                      : 'oklch(63.7% 0.237 25.331)'
                  })()}
                  icon={
                    providerOnlineStatuses[value] === 'loading'
                      ? 'svg-spinners:ring-resize'
                      : undefined
                  }
                  label={value}
                  value={value}
                />
              ))}
            </Listbox>
            <SearchInput
              actionButtonProps={{
                icon: 'tabler:scan',
                onClick: () => {
                  open(QRCodeScanner, {
                    formats: ['linear_codes'],
                    onScanned: data => {
                      setSearchQuery(data)
                    }
                  })
                }
              }}
              className="component-bg-lighter-with-hover"
              namespace="apps.booksLibrary"
              searchTarget="Libgen Book"
              value={searchQuery}
              onChange={setSearchQuery}
              onKeyUp={e => {
                if (e.key === 'Enter') {
                  triggerFetch()
                }
              }}
            />
            <Button
              className="w-full sm:w-auto"
              disabled={providerOnlineStatuses[provider] === false}
              icon="tabler:arrow-right"
              iconPosition="end"
              loading={
                loading || providerOnlineStatuses[provider] === 'loading'
              }
              onClick={() => {
                triggerFetch()
              }}
            >
              search
            </Button>
          </div>
          <Scrollbar className="mt-4 flex-1">
            {(() => {
              if (loading || providerOnlineStatuses[provider] === 'loading') {
                return <LoadingScreen />
              }

              if (!providerOnlineStatuses[provider]) {
                return (
                  <EmptyStateScreen
                    icon="tabler:cloud-off"
                    message={{
                      id: 'libgenOffline',
                      namespace: 'apps.booksLibrary'
                    }}
                  />
                )
              }

              if (hasSearched) {
                if (data === null) {
                  return (
                    <EmptyStateScreen
                      icon="tabler:books-off"
                      message={{
                        id: 'libgenResult',
                        namespace: 'apps.booksLibrary'
                      }}
                    />
                  )
                }

                return (
                  <>
                    <div className="mb-4 space-y-1">
                      <p className="text-bg-500 text-lg font-medium">
                        Search results for{' '}
                        <span className="text-bg-800 dark:text-bg-100">
                          &quot;{data.query}&quot;
                        </span>
                      </p>
                      <p className="text-bg-500 text-sm font-light">
                        {data.resultsCount}
                      </p>
                    </div>
                    <Pagination
                      className="mb-4"
                      page={data.page}
                      totalPages={totalPages}
                      onPageChange={page => {
                        triggerFetch(
                          typeof page === 'number' ? page : page(data.page)
                        ).catch(console.error)
                      }}
                    />
                    <ul className="space-y-3">
                      {data.data.map((book: any) => (
                        <SearchResultItem
                          key={book.id}
                          book={book}
                          provider={data.provider}
                          setViewDetailsFor={setViewDetailsFor}
                        />
                      ))}
                    </ul>
                    <Pagination
                      className="mt-4"
                      page={data.page}
                      totalPages={totalPages}
                      onPageChange={page => {
                        triggerFetch(
                          typeof page === 'number' ? page : page(data.page)
                        ).catch(console.error)
                      }}
                    />
                  </>
                )
              }

              return (
                <EmptyStateScreen
                  icon="tabler:book"
                  message={{
                    id: 'libgen',
                    namespace: 'apps.booksLibrary'
                  }}
                />
              )
            })()}
          </Scrollbar>
        </>
      )}
    </div>
  )
}

export default LibgenModal
