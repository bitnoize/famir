/**
 * Options for parsing query strings.
 */
export { IParseBaseOptions as ParseQueryStringOptions } from 'qs'

/**
 * Options for formatting query strings.
 */
export { IStringifyBaseOptions as FormatQueryStringOptions } from 'qs'

/**
 * Parses a query string object from a string.
 *
 * @internal
 */
export { parse as parseQueryString } from 'qs'

/**
 * Formats a query string object to a string.
 *
 * @internal
 */
export { stringify as formatQueryString } from 'qs'
