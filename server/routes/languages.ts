import { forgeController, forgeRouter } from '@functions/routes'
import { SCHEMAS } from '@schema'
import z from 'zod'

const list = forgeController
  .query()
  .description({
    en: 'Get all book languages',
    ms: 'Dapatkan semua bahasa buku',
    'zh-CN': '获取所有书籍语言',
    'zh-TW': '獲取所有書籍語言'
  })
  .input({})
  .callback(({ pb }) =>
    pb.getFullList.collection('books_library__languages_aggregated').execute()
  )

const create = forgeController
  .mutation()
  .description({
    en: 'Create a new book language',
    ms: 'Cipta bahasa buku baharu',
    'zh-CN': '创建新的书籍语言',
    'zh-TW': '創建新的書籍語言'
  })
  .input({
    body: SCHEMAS.books_library.languages.schema
  })
  .statusCode(201)
  .callback(({ pb, body }) =>
    pb.create.collection('books_library__languages').data(body).execute()
  )

const update = forgeController
  .mutation()
  .description({
    en: 'Update an existing book language',
    ms: 'Kemas kini bahasa buku sedia ada',
    'zh-CN': '更新现有的书籍语言',
    'zh-TW': '更新現有的書籍語言'
  })
  .input({
    query: z.object({
      id: z.string()
    }),
    body: SCHEMAS.books_library.languages.schema
  })
  .existenceCheck('query', {
    id: 'books_library__languages'
  })
  .callback(({ pb, query: { id }, body }) =>
    pb.update.collection('books_library__languages').id(id).data(body).execute()
  )

const remove = forgeController
  .mutation()
  .description({
    en: 'Delete a book language',
    ms: 'Padam bahasa buku',
    'zh-CN': '删除书籍语言',
    'zh-TW': '刪除書籍語言'
  })
  .input({
    query: z.object({
      id: z.string()
    })
  })
  .existenceCheck('query', {
    id: 'books_library__languages'
  })
  .statusCode(204)
  .callback(({ pb, query: { id } }) =>
    pb.delete.collection('books_library__languages').id(id).execute()
  )

export default forgeRouter({
  list,
  create,
  update,
  remove
})
