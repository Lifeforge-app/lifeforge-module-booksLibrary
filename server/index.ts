import { forgeRouter, writeContractFileToClient } from '@lifeforge/server-utils'

import * as collectionsRoutes from './routes/collection'
import * as countRoutes from './routes/count'
import * as entriesRoutes from './routes/entries'
import * as formatsRoutes from './routes/formats'
import * as languagesRoutes from './routes/languages'
import {
  cover as doubanCover,
  detail as doubanDetail
} from './routes/providers/douban'
import { detail as goodreadsDetail } from './routes/providers/goodreads'
import { detail as kingstoneDetail } from './routes/providers/kingstone'
import { covers as openLibraryCovers } from './routes/providers/openLibrary'
import { search as providersSearch } from './routes/providers/search'

const routes = forgeRouter({
  entries: entriesRoutes,
  collections: collectionsRoutes,
  languages: languagesRoutes,
  formats: formatsRoutes,
  count: countRoutes,
  providers: forgeRouter({
    search: providersSearch,
    openLibrary: { covers: openLibraryCovers },
    douban: { detail: doubanDetail, cover: doubanCover },
    goodreads: { detail: goodreadsDetail },
    kingstone: { detail: kingstoneDetail }
  })
})

writeContractFileToClient(routes, import.meta.dirname)

export default routes
