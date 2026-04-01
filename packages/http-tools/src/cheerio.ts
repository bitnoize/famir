import * as cheerio from 'cheerio'

export type CheerioAPI = cheerio.CheerioAPI
export type CheerioOptions = cheerio.CheerioOptions

/*
 * Load and parse HTML
 */
export function cheerioLoad(
  value: string,
  options?: CheerioOptions,
  isDocument?: boolean
): CheerioAPI {
  return cheerio.load(value, options, isDocument)
}
