import { forgeRouter } from '@lifeforge/server-utils'

import * as annasRoutes from './routes/annas'
import * as collectionsRoutes from './routes/collection'
import * as entriesRoutes from './routes/entries'
import * as fileTypesRoutes from './routes/fileTypes'
import * as languagesRoutes from './routes/languages'
import * as libgenRoutes from './routes/libgen'
import * as readStatusRoutes from './routes/readStatus'

export default forgeRouter({
  entries: entriesRoutes,
  collections: collectionsRoutes,
  languages: languagesRoutes,
  fileTypes: fileTypesRoutes,
  readStatus: readStatusRoutes,
  libgen: libgenRoutes,
  annas: annasRoutes
})
