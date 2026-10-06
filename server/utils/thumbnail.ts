import type { FileStorage, StagedFile } from '@lifeforge/file-storage'
import type EPub from 'epub2'

const IMAGE_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'

function imageFetchHeaders(url: string): Record<string, string> {
  const headers: Record<string, string> = {
    'User-Agent': IMAGE_USER_AGENT
  }

  if (url.includes('douban')) {
    headers.Referer = 'https://book.douban.com/'
  }

  return headers
}

type ThumbnailSource =
  | { kind: 'file'; file: StagedFile }
  | { kind: 'generated'; file: File }
  | { kind: 'url'; url: string }

async function fetchImageUpload(url: string) {
  try {
    const res = await fetch(url, {
      headers: imageFetchHeaders(url),
      signal: AbortSignal.timeout(10000)
    })

    const mimeType = res.headers.get('content-type') ?? 'image/jpeg'

    if (!res.ok || !mimeType.startsWith('image/')) {
      return null
    }

    return {
      buffer: Buffer.from(await res.arrayBuffer()),
      originalName: `cover.${mimeType.split('/')[1] || 'jpg'}`,
      mimeType
    }
  } catch {
    return null
  }
}

/**
 * Saves a single thumbnail source and returns its new key, or `null` when the
 * source could not be fetched.
 */
async function saveThumbnailSource(
  storage: FileStorage,
  source: ThumbnailSource,
  currentKey?: string
): Promise<string | null> {
  if (source.kind === 'url') {
    const upload = await fetchImageUpload(source.url)

    if (!upload) {
      return null
    }

    return (
      await storage.save({ file: upload, currentKey, thumbs: ['200x0'] })
    )?.key ?? ''
  }

  const file =
    source.kind === 'file'
      ? source.file
      : {
          buffer: Buffer.from(await source.file.arrayBuffer()),
          originalName: source.file.name,
          mimeType: source.file.type
        }

  return (await storage.save({ file, currentKey, thumbs: ['200x0'] }))?.key ?? ''
}

/**
 * Resolves the `thumbnail` request value — `'keep' | 'removed' | <url> | <file>`
 * — into the thumbnail key to persist, or `undefined` to leave it unchanged.
 */
export async function resolveThumbnail(
  storage: FileStorage,
  thumbnail: StagedFile | string | undefined,
  currentKey: string | undefined,
  generatedThumbnail: File | undefined
): Promise<string | undefined> {
  if (thumbnail === 'removed') {
    await storage.save({ file: 'removed', currentKey })

    return ''
  }

  if (thumbnail !== undefined && thumbnail !== 'keep') {
    const source: ThumbnailSource =
      typeof thumbnail === 'string'
        ? { kind: 'url', url: thumbnail }
        : { kind: 'file', file: thumbnail }

    return (await saveThumbnailSource(storage, source, currentKey)) ?? undefined
  }

  if (!currentKey && generatedThumbnail) {
    return (
      (await saveThumbnailSource(
        storage,
        { kind: 'generated', file: generatedThumbnail },
        currentKey
      )) ?? undefined
    )
  }

  return undefined
}

export function getEpubThumbnail(
  epubInstance: EPub
): Promise<File | undefined> {
  return new Promise((resolve, reject) => {
    const coverId = epubInstance
      .listImage()
      .find(item => item.id?.toLowerCase().includes('cover'))?.id

    if (!coverId) {
      return resolve(undefined)
    }

    epubInstance.getImage(coverId, (error, data, MimeType) => {
      if (error) {
        return reject(error)
      }

      if (!data) {
        return resolve(undefined)
      }

      resolve(new File([Buffer.from(data)], 'cover.jpg', { type: MimeType }))
    })
  })
}
