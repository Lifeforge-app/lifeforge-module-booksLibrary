import { forgeController, forgeRouter } from '@functions/routes'

const list = forgeController
  .query()
  .description({
    en: 'Get all book file types',
    ms: 'Dapatkan semua jenis fail buku',
    'zh-CN': '获取所有书籍文件类型',
    'zh-TW': '獲取所有書籍檔案類型'
  })
  .input({})
  .callback(({ pb }) =>
    pb.getFullList
      .collection('books_library__file_types_aggregated')
      .sort(['name'])
      .execute()
  )

export default forgeRouter({ list })
