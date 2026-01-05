import { forgeController, forgeRouter } from '@functions/routes'

const list = forgeController
  .query()
  .description({
    en: 'Get all book read statuses',
    ms: 'Dapatkan semua status bacaan buku',
    'zh-CN': '获取所有书籍阅读状态',
    'zh-TW': '獲取所有書籍閱讀狀態'
  })
  .input({})
  .callback(({ pb }) =>
    pb.getFullList.collection('booksLibrary__read_status_aggregated').execute()
  )

export default forgeRouter({ list })
