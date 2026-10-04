import { and, eq, ilike, sql } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-orm/zod'
import dayjs from 'dayjs'
import { EPub } from 'epub2'
import { countWords } from 'epub-wordcount'
import fs from 'fs'
import mailer from 'nodemailer'
// @ts-expect-error - No types available
import pdfPageCounter from 'pdf-page-counter'
import z from 'zod'

import forge from '../forge'
import { bookEntries } from '../schema.drizzle'
import getEpubThumbnail from '../utils/getThumbnail'

const entryDto = createSelectSchema(bookEntries).extend({
  languages: z.array(z.string())
})

const READ_STATUS_MAP: Record<string, string> = {
  '1': 'read',
  '2': 'reading',
  '3': 'unread'
}

const uploadInputDto = z.object({
  title: z.string().optional(),
  authors: z.string().optional(),
  edition: z.string().optional(),
  size: z.number().optional(),
  languages: z.array(z.string()).optional(),
  extension: z.string().optional(),
  isbn: z.string().optional(),
  publisher: z.string().optional(),
  year_published: z.number().optional(),
  collection: z.string().optional()
})

const updateInputDto = z.object({
  title: z.string().optional(),
  authors: z.string().optional(),
  edition: z.string().optional(),
  languages: z.array(z.string()).optional(),
  isbn: z.string().optional(),
  publisher: z.string().optional(),
  year_published: z.number().optional(),
  collection: z.string().optional()
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
        query,
        page
      },
      response
    }) => {
      const parsedPage = parseInt(page, 10)
      const PER_PAGE = 20

      const conditions = []

      if (collection) {
        conditions.push(eq(bookEntries.collection, collection))
      }

      if (language) {
        conditions.push(
          sql`jsonb_exists(${bookEntries.languages}, ${language})`
        )
      }

      if (favourite === 'true') {
        conditions.push(eq(bookEntries.is_favourite, true))
      }

      if (readStatus) {
        conditions.push(
          eq(bookEntries.read_status, READ_STATUS_MAP[readStatus])
        )
      }

      if (fileType) {
        const fileTypeRecord = await db.query.file_types.findFirst({
          where: { id: fileType }
        })

        if (fileTypeRecord) {
          conditions.push(eq(bookEntries.extension, fileTypeRecord.name))
        }
      }

      if (query) {
        conditions.push(ilike(bookEntries.title, `%${query}%`))
      }

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
                readStatusOrder[a.read_status] -
                readStatusOrder[b.read_status]
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

export const upload = forge
  .mutation({
    description: 'Upload a new book to the library',
    input: {
      body: uploadInputDto
    },
    media: {
      file: {
        optional: false,
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
      media: { file },
      core: {
        media: { convertPDFToImage },
        storage
      },
      response
    }) => {
      if (typeof file === 'string') {
        return response.badRequest('Invalid file')
      }

      let thumbnailFile: File | undefined = undefined
      let word_count: number | undefined = undefined
      let page_count: number | undefined = undefined

      if (file.mimeType === 'application/epub+zip') {
        const epubInstance = await EPub.createAsync(file.path)
        thumbnailFile = await getEpubThumbnail(epubInstance)
        word_count = await countWords(file.path)
      } else if (file.mimeType === 'application/pdf') {
        thumbnailFile = await convertPDFToImage(file.path)
        const buffer = fs.readFileSync(file.path)
        page_count = (await pdfPageCounter(buffer)).numpages
      }

      const fileRef = await storage.save({ file })

      const thumbnailRef = thumbnailFile
        ? await storage.save({
            file: {
              buffer: Buffer.from(await thumbnailFile.arrayBuffer()),
              originalName: thumbnailFile.name,
              mimeType: thumbnailFile.type
            },
            thumbs: ['200x0']
          })
        : null

      await db.insert(bookEntries).values({
        title: body.title ?? '',
        authors: body.authors ?? '',
        edition: body.edition ?? '',
        size: body.size ?? 0,
        languages: body.languages ?? [],
        extension: body.extension ?? '',
        isbn: body.isbn ?? '',
        publisher: body.publisher ?? '',
        year_published: body.year_published ?? 0,
        collection: body.collection || null,
        file: fileRef?.key ?? '',
        thumbnail: thumbnailRef?.key ?? '',
        word_count: word_count ?? 0,
        page_count: page_count ?? 0,
        read_status: 'unread'
      })

      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path)
      }

      return response.ok('ok')
    }
  )

export const update = forge
  .mutation({
    input: {
      query: z.object({
        id: forge.existsIn(z.string(), bookEntries)
      }),
      body: updateInputDto
    },
    description: 'Update an existing book entry',
    output: {
      OK: entryDto
    }
  })
  .callback(async ({ db, query: { id }, body, response }) => {
    const [updated] = await db
      .update(bookEntries)
      .set({
        ...body,
        ...(body.collection !== undefined
          ? { collection: body.collection || null }
          : {}),
        updated: new Date()
      })
      .where(eq(bookEntries.id, id))
      .returning()

    return response.ok(updated)
  })

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

export const sendToKindle = forge
  .mutation({
    description: 'Send book to Kindle email',
    input: {
      query: z.object({
        id: forge.existsIn(z.string(), bookEntries)
      }),
      body: z.object({
        target: z.string().email()
      })
    },
    output: {
      OK: z.string()
    }
  })
  .callback(
    async ({
      db,
      io,
      query: { id },
      body: { target },
      core: {
        api: { getAPIKey },
        tasks,
        storage
      },
      response
    }) => {
      const smtpUser = await getAPIKey('smtp-user')

      const smtpPassword = await getAPIKey('smtp-pass')

      if (!smtpUser || !smtpPassword) {
        return response.badRequest(
          'SMTP user or password not found. Please set them in the API Keys module.'
        )
      }

      const transporter = mailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: smtpUser,
          pass: smtpPassword
        }
      })

      try {
        await transporter.verify()
      } catch {
        return response.badRequest('SMTP credentials are invalid')
      }

      const taskid = tasks.add(io, {
        module: 'booksLibrary',
        description: 'Send book to Kindle',
        status: 'pending'
      })

      ;(async () => {
        const entry = await db.query.entries.findFirst({ where: { id } })

        if (!entry) {
          tasks.update(io, taskid, { status: 'failed' })

          return
        }

        const fileStream = await storage.get(entry.file)

        if (!fileStream) {
          tasks.update(io, taskid, { status: 'failed' })

          return
        }

        const chunks: Buffer[] = []

        for await (const chunk of fileStream.stream) {
          chunks.push(Buffer.from(chunk))
        }

        const content = Buffer.concat(chunks)

        const fileName = `${entry.title}.${entry.extension}`

        const mail = {
          from: `"Lifeforge Books Library" <${smtpUser}>`,
          to: target,
          subject: '',
          text: `Here is your book: ${entry.title}`,
          attachments: [
            {
              filename: fileName,
              content
            }
          ],
          headers: {
            'X-SES-CONFIGURATION-SET': 'Kindle'
          }
        }

        try {
          await transporter.sendMail(mail)

          tasks.update(io, taskid, {
            status: 'completed'
          })
        } catch (err) {
          console.error('Failed to send email:', err)
          tasks.update(io, taskid, {
            status: 'failed',
            error: 'Failed to send email'
          })
        }
      })()

      return response.ok(taskid)
    }
  )

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
