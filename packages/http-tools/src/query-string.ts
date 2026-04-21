import { HttpQueryString } from '@famir/http-proto'
import qs from 'qs'

/**
 * @category none
 * @internal
 */
export type HttpParseQueryStringOptions = qs.IParseBaseOptions

/**
 * @category none
 * @internal
 */
export type HttpFormatQueryStringOptions = qs.IStringifyBaseOptions

/**
 * @category none
 * @internal
 */
export function parseQueryString(
  value: string,
  options: HttpParseQueryStringOptions
): HttpQueryString {
  return qs.parse(value.trim(), options)
}

/**
 * @category none
 * @internal
 */
export function formatQueryString(
  queryString: HttpQueryString,
  options: HttpFormatQueryStringOptions
) {
  return qs.stringify(queryString, options)
}
