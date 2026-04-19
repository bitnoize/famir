import qs from 'qs'

/**
 * Represents a query-string
 * @category Utils
 */
export type HttpQueryString = Record<string, unknown>

/**
 * Parse query-string options
 * @category Utils
 */
export type HttpParseQueryStringOptions = qs.IParseBaseOptions

/**
 * Format query-string options
 * @category Utils
 */
export type HttpFormatQueryStringOptions = qs.IStringifyBaseOptions

/**
 * Parse query-string
 * @category Utils
 */
export function parseQueryString(
  value: string,
  options: HttpParseQueryStringOptions
): HttpQueryString {
  return qs.parse(value.trim(), options)
}

/**
 * Format query-string
 * @category Utils
 */
export function formatQueryString(
  queryString: HttpQueryString,
  options: HttpFormatQueryStringOptions
) {
  return qs.stringify(queryString, options)
}
