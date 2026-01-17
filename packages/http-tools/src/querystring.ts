import { HttpQueryString } from '@famir/domain'
import qs from 'qs'

export type ParseQueryStringOptions = qs.IParseBaseOptions
export type FormatQueryStringOptions = qs.IStringifyBaseOptions

export function parseQueryString(
  value: string,
  options?: ParseQueryStringOptions
): HttpQueryString {
  return qs.parse(value, options)
}

export function formatQueryString(
  queryString: HttpQueryString,
  options?: FormatQueryStringOptions
): string {
  return qs.stringify(queryString, options)
}
