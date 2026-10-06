import dayjs from 'dayjs'
import { type SQL, and, arrayContains, eq, ilike, or, sql } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-orm/zod'
import { EPub } from 'epub2'
import fs from 'fs'
import z from 'zod'

import forge from '../forge'
import { bookEntries } from '../schema.drizzle'
import { extractBookFileData } from '../utils/bookFile'
import { resolveThumbnail } from '../utils/thumbnail'

const entryDto = createSelectSchema(bookEntries).extend({
  languages: z.array(z.string())
})

const READ_STATUS_MAP: Record<string, string> = {
  '1': 'read',
  '2': 'reading',
  '3': 'unread'
}

const bookInputDto = z.object({
  title: z.string().optional(),
  authors: z.string().optional(),
  edition: z.string().optional(),
  languages: z.array(z.string()).optional(),
  isbn: z.string().optional(),
  publisher: z.string().optional(),
  year_published: z.number().optional(),
  page_count: z.number().optional(),
  collection: z.string().optional(),
  formats: z.array(z.enum(['ebook', 'physical'])).optional()
})

export const list = forge
  .query({
    description:
      'Get all book entries. If the user asks for books from a specific collection, retrieve the collection ID first. Read status mapping: 1=read, 2=reading, 3=unread. Use query field for book name searches.',
    input: {
      query: z.object({
        page: z.string().default('1'),
        collection: z
          .string()
          .optional()
          .describe('Collection ID of the collection'),
        language: z.string().optional(),
        favourite: z.enum(['true', 'false']).optional(),
        readStatus: z.enum(['1', '2', '3']).optional(),
        fileType: z.string().optional(),
        format: z.enum(['ebook', 'physical']).optional(),
        query: z.string().optional()
      })
    },
    output: {
      OK: z.object({
        page: z.number(),
        totalPages: z.number(),
        totalItems: z.number(),
        items: z.array(entryDto)
      })
    }
  })
  .callback(
    async ({
      db,
      query: {
        collection,
        language,
        favourite,
        fileType,
        readStatus,
        format,
        query,
        page
      },
      response
    }) => {
      const parsedPage = parseInt(page, 10)
      const PER_PAGE = 20

      const fileTypeRecord = fileType
        ? await db.query.file_types.findFirst({ where: { id: fileType } })
        : undefined

      const conditions = [
        collection && eq(bookEntries.collection, collection),
        language && sql`jsonb_exists(${bookEntries.languages}, ${language})`,
        favourite === 'true' && eq(bookEntries.is_favourite, true),
        readStatus && eq(bookEntries.read_status, READ_STATUS_MAP[readStatus]),
        fileTypeRecord && eq(bookEntries.extension, fileTypeRecord.name),
        format && arrayContains(bookEntries.formats, [format]),
        query &&
          or(
            ilike(bookEntries.title, `%${query}%`),
            ilike(bookEntries.authors, `%${query}%`),
            ilike(bookEntries.publisher, `%${query}%`),
            ilike(bookEntries.isbn, `%${query}%`),
            ilike(bookEntries.edition, `%${query}%`)
          )
      ].filter((condition): condition is SQL => Boolean(condition))

      const results = await db
        .select()
        .from(bookEntries)
        .where(conditions.length > 0 ? and(...conditions) : undefined)

      return response.ok({
        page: parsedPage,
        totalPages: Math.ceil(results.length / PER_PAGE),
        totalItems: results.length,
        items: results
          .sort((a, b) => {
            const readStatusOrder: Record<string, number> = {
              reading: 1,
              unread: 2,
              read: 3
            }

            if (a.read_status !== b.read_status) {
              return (
                readStatusOrder[a.read_status] - readStatusOrder[b.read_status]
              )
            }

            if (a.read_status === 'reading') {
              return (
                new Date(b.time_started ?? 0).getTime() -
                new Date(a.time_started ?? 0).getTime()
              )
            }

            return (
              +b.is_favourite - +a.is_favourite ||
              a.title.localeCompare(b.title)
            )
          })
          .slice((parsedPage - 1) * PER_PAGE, parsedPage * PER_PAGE)
      })
    }
  )

export const create = forge
  .mutation({
    description:
      'Create a new book entry. Can optionally include an ebook file and/or a cover image.',
    input: {
      body: bookInputDto
    },
    media: {
      file: {
        optional: true,
        multiple: false
      },
      thumbnail: {
        optional: true,
        multiple: false
      }
    },
    output: {
      OK: z.string()
    }
  })
  .callback(
    async ({
      db,
      body,
      media: { file, thumbnail },
      core: {
        media: { convertPDFToImage },
        storage
      },
      response
    }) => {
      const bookFile = typeof file === 'string' ? undefined : file

      const formats = body.formats ?? (bookFile ? ['ebook'] : ['physical'])

      if (formats.includes('ebook') && !bookFile) {
        return response.badRequest('An ebook file is required')
      }

      const extracted = bookFile
        ? await extractBookFileData(bookFile, convertPDFToImage)
        : undefined

      const fileRef = bookFile ? await storage.save({ file: bookFile }) : null

      const thumbnailKey = await resolveThumbnail(
        storage,
        thumbnail,
        undefined,
        extracted?.generatedThumbnail
      )

      await db.insert(bookEntries).values({
        title: body.title ?? '',
        authors: body.authors ?? '',
        edition: body.edition ?? '',
        size: extracted?.size ?? 0,
        languages: body.languages ?? [],
        extension: extracted?.extension ?? '',
        isbn: body.isbn ?? '',
        publisher: body.publisher ?? '',
        year_published: body.year_published ?? 0,
        collection: body.collection || null,
        formats,
        file: fileRef?.key ?? '',
        thumbnail: thumbnailKey ?? '',
        word_count: extracted?.word_count ?? 0,
        page_count: body.page_count ?? extracted?.page_count ?? 0,
        read_status: 'unread'
      })

      return response.ok('ok')
    }
  )

export const update = forge
  .mutation({
    input: {
      query: z.object({
        id: forge.existsIn(z.string(), bookEntries)
      }),
      body: bookInputDto
    },
    media: {
      file: {
        optional: true,
        multiple: false
      },
      thumbnail: {
        optional: true,
        multiple: false
      }
    },
    description: 'Update an existing book entry',
    output: {
      OK: entryDto
    }
  })
  .callback(
    async ({
      db,
      query: { id },
      body,
      media: { file, thumbnail },
      core: {
        media: { convertPDFToImage },
        storage
      },
      response
    }) => {
      const existing = (await db.query.entries.findFirst({ where: { id } }))!
      const bookFile = typeof file === 'string' ? undefined : file

      const formats = body.formats ?? existing.formats

      if (formats.includes('ebook') && !bookFile && !existing.file) {
        return response.badRequest('An ebook file is required')
      }

      const extracted = bookFile
        ? await extractBookFileData(bookFile, convertPDFToImage)
        : undefined

      const fileKey = bookFile
        ? (
            await storage.save({
              file: bookFile,
              currentKey: existing.file || undefined
            })
          )?.key
        : undefined

      const thumbnailKey = await resolveThumbnail(
        storage,
        thumbnail,
        existing.thumbnail || undefined,
        extracted?.generatedThumbnail
      )

      const [updated] = await db
        .update(bookEntries)
        .set({
          ...body,
          formats,
          ...(body.collection !== undefined
            ? { collection: body.collection || null }
            : {}),
          ...(fileKey !== undefined
            ? {
                file: fileKey,
                extension: extracted?.extension ?? '',
                size: extracted?.size ?? 0,
                word_count: extracted?.word_count ?? 0,
                page_count: body.page_count ?? extracted?.page_count ?? 0
              }
            : {}),
          ...(thumbnailKey !== undefined ? { thumbnail: thumbnailKey } : {}),
          updated: new Date()
        })
        .where(eq(bookEntries.id, id))
        .returning()

      return response.ok(updated)
    }
  )

export const toggleFavouriteStatus = forge
  .mutation({
    description: 'Toggle book favorite status',
    input: {
      query: z.object({
        id: forge.existsIn(z.string(), bookEntries)
      })
    },
    output: {
      OK: entryDto
    }
  })
  .callback(async ({ db, query: { id }, response }) => {
    const book = (await db.query.entries.findFirst({ where: { id } }))!

    const [updated] = await db
      .update(bookEntries)
      .set({ is_favourite: !book.is_favourite, updated: new Date() })
      .where(eq(bookEntries.id, id))
      .returning()

    return response.ok(updated)
  })

export const toggleReadStatus = forge
  .mutation({
    description: 'Toggle book read status',
    input: {
      query: z.object({
        id: forge.existsIn(z.string(), bookEntries)
      })
    },
    output: {
      OK: entryDto
    }
  })
  .callback(async ({ db, query: { id }, response }) => {
    const book = (await db.query.entries.findFirst({ where: { id } }))!

    const newStatus = {
      unread: 'reading',
      read: 'unread',
      reading: 'read'
    }[book.read_status] as string

    const set: Record<string, unknown> = {
      read_status: newStatus,
      updated: new Date()
    }

    if (book.read_status === 'unread') {
      set.time_started = new Date()
    }

    if (book.read_status === 'read') {
      set.time_started = null
      set.time_finished = null
    }

    if (book.read_status === 'reading') {
      set.time_finished = new Date()
    }

    const [updated] = await db
      .update(bookEntries)
      .set(set)
      .where(eq(bookEntries.id, id))
      .returning()

    return response.ok(updated)
  })

export const getEpubMetadata = forge
  .mutation({
    description: 'Get EPUB file metadata',
    media: {
      document: {
        optional: false,
        multiple: false
      }
    },
    output: {
      OK: z.object({
        isbn: z.string(),
        title: z.string(),
        authors: z.string(),
        publisher: z.string(),
        year_published: z.number()
      })
    }
  })
  .callback(async ({ media: { document }, response }) => {
    if (typeof document === 'string') {
      return response.badRequest('Invalid media type')
    }

    const epubInstance = await EPub.createAsync(document.path)

    const metadata = epubInstance.metadata

    if (fs.existsSync(document.path)) {
      fs.unlinkSync(document.path)
    }

    return response.ok({
      isbn: metadata.ISBN,
      title: metadata.title,
      authors: metadata.creator,
      publisher: metadata.publisher,
      year_published: dayjs(metadata.date).year()
    })
  })

export const remove = forge
  .mutation({
    description: 'Delete a book entry',
    input: {
      query: z.object({
        id: forge.existsIn(z.string(), bookEntries)
      })
    },
    output: {
      NO_CONTENT: true
    }
  })
  .callback(async ({ db, query: { id }, core, response }) => {
    const entry = await db.query.entries.findFirst({ where: { id } })

    if (entry) {
      for (const key of [entry.file, entry.thumbnail]) {
        if (key) {
          await core.storage.delete(key)
        }
      }
    }

    await db.delete(bookEntries).where(eq(bookEntries.id, id))

    return response.noContent()
  })
