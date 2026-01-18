import z from 'zod'

import forge from '../forge'
import schema from '../schema'

export const list = forge
  .query()
  .description('Get all book languages')
  .input({})
  .callback(({ pb }) =>
    pb.getFullList.collection('languages_aggregated').execute()
  )

export const create = forge
  .mutation()
  .description('Create a new book language')
  .input({
    body: schema.languages
  })
  .statusCode(201)
  .callback(({ pb, body }) =>
    pb.create.collection('languages').data(body).execute()
  )

export const update = forge
  .mutation()
  .description('Update an existing book language')
  .input({
    query: z.object({
      id: z.string()
    }),
    body: schema.languages
  })
  .existenceCheck('query', {
    id: 'languages'
  })
  .callback(({ pb, query: { id }, body }) =>
    pb.update.collection('languages').id(id).data(body).execute()
  )

export const remove = forge
  .mutation()
  .description('Delete a book language')
  .input({
    query: z.object({
      id: z.string()
    })
  })
  .existenceCheck('query', {
    id: 'languages'
  })
  .statusCode(204)
  .callback(({ pb, query: { id } }) =>
    pb.delete.collection('languages').id(id).execute()
  )
