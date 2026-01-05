import { SCHEMAS } from '@schema'
import z from 'zod'

import { forgeController, forgeRouter } from '@functions/routes'

const list = forgeController
  .query()
  .description({
    en: 'Get all book collections. If the user asks to list books in a specific collection, call this tool first to get the collection ID.',
    ms: 'Dapatkan semua koleksi buku. Jika pengguna meminta untuk menyenaraikan buku dalam koleksi tertentu, panggil alat ini terlebih dahulu untuk mendapatkan ID koleksi.',
    'zh-CN':
      '获取所有书籍集合。如果用户要求列出特定集合中的书籍，请先调用此工具获取集合ID。',
    'zh-TW':
      '獲取所有書籍集合。如果使用者要求列出特定集合中的書籍，請先呼叫此工具獲取集合ID。'
  })
  .input({})
  .callback(({ pb }) =>
    pb.getFullList
      .collection('booksLibrary__collections_aggregated')
      .sort(['name'])
      .execute()
  )

const create = forgeController
  .mutation()
  .description({
    en: 'Create a new book collection',
    ms: 'Cipta koleksi buku baharu',
    'zh-CN': '创建新的书籍集合',
    'zh-TW': '創建新的書籍集合'
  })
  .input({
    body: SCHEMAS.booksLibrary.collections.schema
  })
  .statusCode(201)
  .callback(({ pb, body }) =>
    pb.create.collection('booksLibrary__collections').data(body).execute()
  )

const update = forgeController
  .mutation()
  .description({
    en: 'Update an existing book collection',
    ms: 'Kemas kini koleksi buku sedia ada',
    'zh-CN': '更新现有的书籍集合',
    'zh-TW': '更新現有的書籍集合'
  })
  .input({
    query: z.object({
      id: z.string()
    }),
    body: SCHEMAS.booksLibrary.collections.schema
  })
  .existenceCheck('query', {
    id: 'booksLibrary__collections'
  })
  .callback(({ pb, query: { id }, body }) =>
    pb.update
      .collection('booksLibrary__collections')
      .id(id)
      .data(body)
      .execute()
  )

const remove = forgeController
  .mutation()
  .description({
    en: 'Delete a book collection',
    ms: 'Padam koleksi buku',
    'zh-CN': '删除书籍集合',
    'zh-TW': '刪除書籍集合'
  })
  .input({
    query: z.object({
      id: z.string()
    })
  })
  .existenceCheck('query', {
    id: 'booksLibrary__collections'
  })
  .statusCode(204)
  .callback(({ pb, query: { id } }) =>
    pb.delete.collection('booksLibrary__collections').id(id).execute()
  )

export default forgeRouter({
  list,
  create,
  update,
  remove
})
