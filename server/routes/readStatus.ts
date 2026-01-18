import forge from '../forge'

export const list = forge
  .query()
  .description('Get all book read statuses')
  .input({})
  .callback(({ pb }) =>
    pb.getFullList.collection('read_status_aggregated').execute()
  )
