import qs from 'qs'

export type HttpQueryString = Record<string, unknown>
export type HttpParseQueryStringOptions = qs.IParseBaseOptions
export type HttpFormatQueryStringOptions = qs.IStringifyBaseOptions

/*
 * Parse query-string
 */
export function parseQueryString(
  value: string,
  options: HttpParseQueryStringOptions
): HttpQueryString {
  return qs.parse(value.trim(), options)
}

/*
 * Format query-string
 */
export function formatQueryString(
  queryString: HttpQueryString,
  options: HttpFormatQueryStringOptions
) {
  return qs.stringify(queryString, options)
}
