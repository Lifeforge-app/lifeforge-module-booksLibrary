import forge from '../forge'

export const list = forge
  .query()
  .description('Get all book file types')
  .input({})
  .callback(({ pb }) =>
    pb.getFullList.collection('file_types_aggregated').sort(['name']).execute()
  )
