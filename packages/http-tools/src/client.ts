import { HttpHeaders } from '@famir/domain'
import { isbot } from 'isbot'
import { getHeader, getHeaderArray } from './headers.js'

function parseClientIp(values: string[]): string[] {
  return values
    .join(',')
    .split(',')
    .map((ip) => ip.trim())
    .filter((ip) => ip)
}

export function getClientIp(headers: HttpHeaders): string[] {
  const values = getHeaderArray(headers, 'X-Forwarded-For') ?? []

  return parseClientIp(values)
}

export function isBot(headers: HttpHeaders): boolean {
  const value = getHeader(headers, 'User-Agent')

  return isbot(value)
}
