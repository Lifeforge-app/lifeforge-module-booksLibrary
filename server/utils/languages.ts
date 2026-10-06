import marcLanguages from './marc-languages.json'

/** MARC 21 / ISO 639-2(B) language codes, as published by the Library of Congress. */
export const MARC_LANGUAGE_MAP: Record<string, string> = marcLanguages

/** Whether the given value is a valid MARC 21 language code. */
export function isValidMarcCode(code: string): boolean {
  return Object.prototype.hasOwnProperty.call(MARC_LANGUAGE_MAP, code)
}

/** Human-readable name for a MARC code, falling back to the code itself. */
export function marcCodeToName(code: string): string {
  return MARC_LANGUAGE_MAP[code.toLowerCase()] ?? code
}
