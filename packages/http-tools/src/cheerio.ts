import * as cheerio from 'cheerio'

export type CheerioAPI = cheerio.CheerioAPI
export type CheerioOptions = cheerio.CheerioOptions

export function cheerioLoad(
  value: string,
  options?: CheerioOptions,
  isDocument?: boolean
): CheerioAPI {
  return cheerio.load(value, options, isDocument)
}
