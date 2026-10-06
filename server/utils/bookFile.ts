import { EPub } from 'epub2'
import { countWords } from 'epub-wordcount'
import fs from 'fs'
// @ts-expect-error - No types available
import pdfPageCounter from 'pdf-page-counter'

import { getEpubThumbnail } from './thumbnail'

export async function extractBookFileData(
  bookFile: {
    mimeType: string
    path: string
    originalName: string
    size: number
  },
  convertPDFToImage: (path: string) => Promise<File | undefined>
) {
  let generatedThumbnail: File | undefined
  let word_count = 0
  let page_count = 0

  if (bookFile.mimeType === 'application/epub+zip') {
    const epubInstance = await EPub.createAsync(bookFile.path)

    generatedThumbnail = await getEpubThumbnail(epubInstance)
    word_count = await countWords(bookFile.path)
  } else if (bookFile.mimeType === 'application/pdf') {
    generatedThumbnail = await convertPDFToImage(bookFile.path)

    const buffer = fs.readFileSync(bookFile.path)

    page_count = (await pdfPageCounter(buffer)).numpages
  }

  return {
    extension: bookFile.originalName.split('.').pop() ?? '',
    size: bookFile.size,
    word_count,
    page_count,
    generatedThumbnail
  }
}
