import z from 'zod'

import forge from '../forge'
import schema from '../schema'

export const list = forge
  .query()
  .description(
    'Get all book collections. If the user asks to list books in a specific collection, call this tool first to get the collection ID.'
  )
  .input({})
  .callback(({ pb }) =>
    pb.getFullList.collection('collections_aggregated').sort(['name']).execute()
  )

export const create = forge
  .mutation()
  .description('Create a new book collection')
  .input({
    body: schema.collections
  })
  .statusCode(201)
  .callback(({ pb, body }) =>
    pb.create.collection('collections').data(body).execute()
  )

export const update = forge
  .mutation()
  .description('Update an existing book collection')
  .input({
    query: z.object({
      id: z.string()
    }),
    body: schema.collections
  })
  .existenceCheck('query', {
    id: 'collections'
  })
  .callback(({ pb, query: { id }, body }) =>
    pb.update.collection('collections').id(id).data(body).execute()
  )

export const remove = forge
  .mutation()
  .description('Delete a book collection')
  .input({
    query: z.object({
      id: z.string()
    })
  })
  .existenceCheck('query', {
    id: 'collections'
  })
  .statusCode(204)
  .callback(({ pb, query: { id } }) =>
    pb.delete.collection('collections').id(id).execute()
  )
