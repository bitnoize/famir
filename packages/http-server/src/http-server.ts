import { HttpPlainText, HttpQueryString } from '@famir/domain'
import * as cheerio from 'cheerio'

export interface HttpServerConfig {
  HTTP_SERVER_ADDRESS: string
  HTTP_SERVER_PORT: number
  HTTP_SERVER_ERROR_PAGE: string
}

export interface HttpServerOptions {
  address: string
  port: number
  errorPage: string
}

export interface ParseQueryStringOptions {
  comma?: boolean
  delimiter?: string | RegExp
  depth?: number | false
  arrayLimit?: number
  parseArrays?: boolean
  allowSparse?: boolean
  parameterLimit?: number
  strictNullHandling?: boolean
  ignoreQueryPrefix?: boolean
  interpretNumericEntities?: boolean
  allowEmptyArrays?: boolean
  duplicates?: 'combine' | 'first' | 'last'
  strictDepth?: boolean
  throwOnLimitExceeded?: boolean
}

export interface FormatQueryStringOptions {
  delimiter?: string
  strictNullHandling?: boolean
  skipNulls?: boolean
  encode?: boolean
  arrayFormat?: 'indices' | 'brackets' | 'repeat' | 'comma'
  indices?: boolean
  format?: 'RFC1738' | 'RFC3986'
  encodeValuesOnly?: boolean
  addQueryPrefix?: boolean
  allowEmptyArrays?: boolean
  commaRoundTrip?: boolean
}

export type CheerioRoot = cheerio.Root

export interface ParseHtmlOptions {
  baseURI?: string | URL
  quirksMode?: boolean
  scriptingEnabled?: boolean
  xml?: boolean
}

export type QueryStringWrapper = (query: HttpQueryString) => void
export type PlainTextWrapper = (text: HttpPlainText) => void
export type JsonWrapper = (json: object) => void
export type HtmlWrapper = ($: CheerioRoot) => void
