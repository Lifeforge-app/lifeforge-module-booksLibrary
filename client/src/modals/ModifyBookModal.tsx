import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import z from 'zod'

import { useModuleTranslation } from '@lifeforge/localization'
import {
  Button,
  FileField,
  type FileValue,
  FormModal,
  ListboxField,
  NumberField,
  QRCodeScanner,
  TextField,
  convertFormFileFieldData,
  createDefaultValues,
  fileValueSchema,
  toast,
  useModalStore
} from '@lifeforge/ui'

import { forgeAPI } from '@/manifest'

import CoverPickerModal from './CoverPickerModal'

const NEW_LANGUAGE_PREFIX = '__new__:'

export interface BookInitialData {
  id?: string
  title?: string
  authors?: string
  edition?: string
  isbn?: string
  publisher?: string
  year_published?: number
  page_count?: number
  collection?: string
  languages?: string[]
  formats?: ('ebook' | 'physical')[]
  thumbnail?: string
  thumbnailUrl?: string
  file?: FileValue
}

const schema = z.object({
  title: z.string().min(1, 'Required'),
  authors: z.string().min(1, 'Required'),
  publisher: z.string().min(1, 'Required'),
  year_published: z.number().nonnegative(),
  page_count: z.number().nonnegative(),
  edition: z.string().catch(''),
  isbn: z.string().catch(''),
  collection: z.string(),
  languages: z.array(z.string()).min(1, 'Required'),
  formats: z.array(z.enum(['ebook', 'physical'])).min(1, 'Required'),
  file: fileValueSchema,
  thumbnail: fileValueSchema
})

function ModifyBookModal({
  data: { initialData = {}, detectedLanguages = [] },
  onClose
}: {
  data: {
    initialData?: BookInitialData
    detectedLanguages?: { code: string; name: string }[]
  }
  onClose: () => void
}) {
  const isEdit = Boolean(initialData.id)

  const { t } = useModuleTranslation()
  const queryClient = useQueryClient()
  const { open } = useModalStore()
  const [detected, setDetected] = useState(detectedLanguages)
  const collectionsQuery = useQuery(forgeAPI.collections.list.queryOptions())
  const languagesQuery = useQuery(forgeAPI.count.languages.queryOptions())

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: forgeAPI.entries.key })
    queryClient.invalidateQueries({ queryKey: forgeAPI.collections.key })
    queryClient.invalidateQueries({ queryKey: forgeAPI.count.key })
    queryClient.invalidateQueries({ queryKey: forgeAPI.formats.key })
    queryClient.invalidateQueries({ queryKey: forgeAPI.providers.key })
  }

  const createMutation = useMutation(
    forgeAPI.entries.create.mutationOptions({
      onSuccess: () => {
        handleSuccess()
        toast.success(t('modals.book.addSuccess'))
      },
      onError: () => {
        toast.error('Failed to add book')
      }
    })
  )

  const updateMutation = useMutation(
    forgeAPI.entries.update
      .input({ id: initialData.id || '' })
      .mutationOptions({
        onSuccess: handleSuccess,
        onError: () => {
          toast.error('Failed to update book data')
        }
      })
  )

  const coverPreviewUrl = (url: string) =>
    url.includes('douban')
      ? forgeAPI.providers.douban.cover.input({
          url: url.replace('/l/', '/m/')
        }).endpoint
      : url

  const makeCoverValue = (url: string) => ({
    type: 'url' as const,
    url,
    preview: coverPreviewUrl(url)
  })

  const form = useForm({
    defaultValues: {
      ...createDefaultValues(schema),
      title: initialData.title ?? '',
      authors: initialData.authors ?? '',
      edition: initialData.edition ?? '',
      isbn: initialData.isbn ?? '',
      publisher: initialData.publisher ?? '',
      year_published: initialData.year_published ?? 0,
      page_count: initialData.page_count ?? 0,
      collection: initialData.collection ?? '',
      languages: initialData.languages ?? [],
      formats: (initialData.formats ?? ['ebook']) as ('ebook' | 'physical')[],
      file: initialData.file ?? { type: 'empty' as const },
      thumbnail: initialData.thumbnail
        ? {
            type: 'existing' as const,
            id: initialData.thumbnail,
            filename: 'cover',
            preview: forgeAPI.getMedia({ key: initialData.thumbnail })
          }
        : initialData.thumbnailUrl
          ? makeCoverValue(initialData.thumbnailUrl)
          : { type: 'empty' as const }
    },
    resolver: zodResolver(schema)
  })

  const formats = useWatch({ control: form.control, name: 'formats' })
  const languages = useWatch({ control: form.control, name: 'languages' })

  const isbn = useWatch({ control: form.control, name: 'isbn' })
  const title = useWatch({ control: form.control, name: 'title' })

  const collectionOptions = collectionsQuery.data
    ? collectionsQuery.data.map(({ id, name, icon }) => ({
        text: name[0].toUpperCase() + name.slice(1),
        value: id,
        icon
      }))
    : []

  const ensureMutation = useMutation(
    forgeAPI.languages.ensure.mutationOptions()
  )

  const languageOptions = (() => {
    const libraryLanguages = languagesQuery.data ?? []
    const options: { text: string; value: string; icon: string }[] = []
    const seen = new Set<string>()

    for (const item of detected) {
      const rows = libraryLanguages.filter(row => row.code === item.code)

      if (rows.length > 0) {
        for (const row of rows) {
          if (!seen.has(row.id)) {
            options.push({
              text: row.name[0].toUpperCase() + row.name.slice(1),
              value: row.id,
              icon: row.icon
            })
            seen.add(row.id)
          }
        }
      } else {
        const value = `${NEW_LANGUAGE_PREFIX}${item.code}`

        if (!seen.has(value)) {
          options.push({ text: item.name, value, icon: 'tabler:plus' })
          seen.add(value)
        }
      }
    }

    for (const row of libraryLanguages) {
      if (!seen.has(row.id)) {
        options.push({
          text: row.name[0].toUpperCase() + row.name.slice(1),
          value: row.id,
          icon: row.icon
        })
        seen.add(row.id)
      }
    }

    return options
  })()

  const resolveLanguageIds = async (values: string[]) => {
    const newCodes = [
      ...new Set(
        values
          .filter(value => value.startsWith(NEW_LANGUAGE_PREFIX))
          .map(value => value.slice(NEW_LANGUAGE_PREFIX.length))
      )
    ]

    if (newCodes.length === 0) {
      return values
    }

    const created = await ensureMutation.mutateAsync({ codes: newCodes })

    const idByCode = new Map(created.map(lang => [lang.code, lang.id]))

    return [
      ...new Set(
        values.map(value =>
          value.startsWith(NEW_LANGUAGE_PREFIX)
            ? (idByCode.get(value.slice(NEW_LANGUAGE_PREFIX.length)) ?? value)
            : value
        )
      )
    ]
  }

  const pendingLanguageCodes = languages
    .filter(value => value.startsWith(NEW_LANGUAGE_PREFIX))
    .join(',')

  useEffect(() => {
    if (pendingLanguageCodes === '') {
      return
    }

    let cancelled = false

    void (async () => {
      const resolved = await resolveLanguageIds(form.getValues('languages'))

      if (cancelled) {
        return
      }

      await queryClient.invalidateQueries({ queryKey: forgeAPI.count.key })

      form.setValue('languages', resolved, { shouldDirty: true })
    })()

    return () => {
      cancelled = true
    }
  }, [pendingLanguageCodes])

  const formatOptions = [
    {
      value: 'ebook' as const,
      text: t('formats.eBook'),
      icon: 'tabler:device-tablet'
    },
    {
      value: 'physical' as const,
      text: t('formats.physical'),
      icon: 'tabler:book'
    }
  ]

  const scanIsbn = () => {
    open(QRCodeScanner, {
      formats: ['linear_codes'],
      onScanned: async (data: string) => {
        const isbn = data.trim()

        form.setValue('isbn', isbn, { shouldDirty: true })

        const setCover = (url: string) => {
          if (url) {
            form.setValue('thumbnail', makeCoverValue(url), {
              shouldDirty: true
            })
          }
        }

        try {
          const search = await queryClient.fetchQuery(
            forgeAPI.providers.search
              .input({ q: isbn, page: '1' })
              .queryOptions()
          )

          const result = search.results[0]

          if (!result) {
            toast.error('No book found for this barcode')

            return
          }

          const detail =
            result.source === 'openlibrary'
              ? null
              : result.source === 'douban'
                ? await forgeAPI.providers.douban.detail
                    .input({ id: result.key })
                    .query()
                    .catch(() => null)
                : await forgeAPI.providers.kingstone.detail
                    .input({ id: result.key })
                    .query()
                    .catch(() => null)

          form.setValue('title', detail?.title || result.title, {
            shouldDirty: true
          })
          form.setValue('authors', detail?.authors || result.authors, {
            shouldDirty: true
          })
          form.setValue('publisher', detail?.publisher || result.publisher, {
            shouldDirty: true
          })
          form.setValue('year_published', detail?.year || result.year, {
            shouldDirty: true
          })
          form.setValue('page_count', detail?.pageCount || result.pageCount, {
            shouldDirty: true
          })
          form.setValue('isbn', detail?.isbn || result.isbn || isbn, {
            shouldDirty: true
          })

          if (result.source === 'openlibrary') {
            setDetected(result.languages)
          }

          setCover(detail?.coverUrl || result.coverUrl)
        } catch {
          toast.error('Failed to look up this ISBN')
        }
      }
    })
  }

  const openCoverPicker = () => {
    open(CoverPickerModal, {
      isbn: isbn || undefined,
      title: title || undefined,
      onSelect: url => {
        form.setValue('thumbnail', makeCoverValue(url), { shouldDirty: true })
      }
    })
  }

  const handleSubmit = async (formData: z.infer<typeof schema>) => {
    if (formData.formats.includes('ebook') && formData.file.type === 'empty') {
      throw new Error('An ebook file is required')
    }

    const languages = await resolveLanguageIds(formData.languages)

    const base = {
      title: formData.title,
      authors: formData.authors,
      publisher: formData.publisher,
      year_published: formData.year_published,
      page_count: formData.page_count,
      edition: formData.edition,
      isbn: formData.isbn,
      collection: formData.collection || undefined,
      languages,
      formats: formData.formats
    }

    const thumbnail = convertFormFileFieldData(formData.thumbnail)
    const bookFile =
      formData.file.type === 'upload' ? formData.file.file : undefined

    if (isEdit) {
      await updateMutation.mutateAsync({
        ...base,
        file: bookFile,
        thumbnail
      })

      return
    }

    await createMutation.mutateAsync({
      ...base,
      file: bookFile,
      thumbnail
    })
  }

  return (
    <FormModal
      form={form}
      submissionConfig={{
        template: isEdit ? 'update' : 'create',
        handler: handleSubmit
      }}
      uiConfig={{
        icon: isEdit ? 'tabler:pencil' : 'keyline-icons:book-plus',
        loading: collectionsQuery.isLoading,
        title: isEdit ? 'book.update' : 'book.create',
        onClose
      }}
    >
      <TextField
        actionButtonProps={{
          icon: 'tabler:scan',
          onClick: scanIsbn
        }}
        control={form.control}
        icon="tabler:barcode"
        label="ISBN"
        name="isbn"
        placeholder="ISBN"
      />
      <ListboxField
        multiple
        required
        control={form.control}
        icon="tabler:bookmark"
        label="Format"
        name="formats"
        options={formatOptions}
      />
      <ListboxField
        control={form.control}
        icon="heroicons-outline:collection"
        label="Collection"
        name="collection"
        options={collectionOptions}
      />
      <TextField
        required
        control={form.control}
        icon="tabler:book"
        label="Book Title"
        name="title"
        placeholder="Title of the Book"
      />
      <TextField
        control={form.control}
        icon="tabler:number"
        label="Edition"
        name="edition"
        placeholder="Edition"
      />
      <TextField
        required
        control={form.control}
        icon="tabler:users"
        label="Authors"
        name="authors"
        placeholder="Authors"
      />
      <TextField
        required
        control={form.control}
        icon="tabler:building"
        label="Publisher"
        name="publisher"
        placeholder="Publisher"
      />
      <NumberField
        required
        control={form.control}
        icon="tabler:calendar"
        label="Publication Year"
        name="year_published"
        placeholder="20xx"
      />
      <NumberField
        control={form.control}
        icon="tabler:file-text"
        label="Page Count"
        name="page_count"
        placeholder="0"
      />
      <ListboxField
        multiple
        required
        control={form.control}
        icon="tabler:language"
        label="Languages"
        name="languages"
        options={languageOptions}
      />
      <FileField
        control={form.control}
        icon="tabler:photo"
        label="Cover"
        name="thumbnail"
        sources={{ url: true }}
      />
      {(isbn.trim() !== '' || title.trim() !== '') && (
        <Button
          icon="tabler:photo-search"
          variant="secondary"
          onClick={openCoverPicker}
        >
          pickCover
        </Button>
      )}
      {formats.includes('ebook') && (
        <FileField
          required
          control={form.control}
          icon="tabler:file-upload"
          label="Upload Book File"
          mimeTypes={{
            application: ['pdf', 'epub+zip']
          }}
          name="file"
        />
      )}
    </FormModal>
  )
}

export default ModifyBookModal
