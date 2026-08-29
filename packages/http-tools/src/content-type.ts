import { HttpContentType } from '@famir/http-proto'
import { format, parse } from 'content-type'

/**
 * Available values for Content-Type names.
 *
 * @internal
 */
export const HTTP_CONTENT_TYPE_NAMES = [
  'text',
  'html',
  'css',
  'javascript',
  'json',
  'xml',
  'urlEncoded',
] as const

/**
 * Type for Content-Type name.
 *
 * @internal
 */
export type HttpContentTypeName = (typeof HTTP_CONTENT_TYPE_NAMES)[number]

/**
 * Dictionary for grouping Content-Types.
 *
 * @internal
 */
export type HttpContentTypes = Record<HttpContentTypeName, string[]>

/**
 * Parse Content-Type object from a string.
 *
 * @internal
 */
export function parseContentType(str: string): HttpContentType {
  const { type, parameters } = parse(str)

  return { type, parameters }
}

/**
 * Format Content-Type object to a string.
 *
 * @internal
 */
export function formatContentType(obj: {
  type: string
  parameters?: Record<string, string>
}): string {
  return format(obj)
}
