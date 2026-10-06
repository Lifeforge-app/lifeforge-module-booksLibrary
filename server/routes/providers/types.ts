export interface ProviderBook {
  key: string
  title: string
  authors: string
  publisher: string
  year: number
  isbn: string
  coverUrl: string
  pageCount: number
  languages: { code: string; name: string }[]
}

export interface ProviderSearchResult {
  totalPages: number
  results: ProviderBook[]
}
