import * as cheerio from 'cheerio'

export type CheerioAPI = cheerio.CheerioAPI
export type CheerioOptions = cheerio.CheerioOptions

export function cheerioLoad(
  content: string,
  options?: CheerioOptions,
  isDocument?: boolean
): CheerioAPI {
  return cheerio.load(content, options, isDocument)
}
