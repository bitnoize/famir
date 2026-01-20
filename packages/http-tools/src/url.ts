import { HttpUrl, HttpUrlQuery } from '@famir/domain'
import querystring from 'node:querystring'
import { URL } from 'node:url'

export function parseUrl(value: string): HttpUrl {
  const url = URL.parse(value, 'http://localhost')

  if (!url) {
    return {
      protocol: 'http:',
      hostname: 'localhost',
      port: '',
      pathname: '/',
      search: '',
      hash: ''
    }
  }

  return {
    protocol: url.protocol,
    hostname: url.hostname,
    port: url.port,
    pathname: url.pathname,
    search: url.search,
    hash: url.hash
  }
}

export function parseUrlQuery(url: HttpUrl): HttpUrlQuery {
  const search = url.search.startsWith('?') ? url.search.slice(0) : url.search
  return querystring.parse(search)
}

export function formatUrl(url: HttpUrl): string {
  return [
    url.protocol,
    '//',
    url.port ? url.hostname + ':' + url.port : url.hostname,
    url.pathname,
    url.search,
    url.hash
  ].join('')
}

export function formatRelativeUrl(url: HttpUrl): string {
  return [url.pathname, url.search, url.hash].join('')
}

export function isUrlPathEquals(url: HttpUrl, value: string | string[]): boolean {
  if (Array.isArray(value)) {
    return value.some((val) => val === url.pathname)
  } else {
    return value === url.pathname
  }
}

export function isUrlPathUnder(url: HttpUrl, value: string | string[]): boolean {
  if (Array.isArray(value)) {
    return value.some((val) => url.pathname.startsWith(val))
  } else {
    return url.pathname.startsWith(value)
  }
}

export function isUrlPathMatch(url: HttpUrl, value: RegExp | RegExp[]): boolean {
  if (Array.isArray(value)) {
    return value.some((val) => val.test(url.pathname))
  } else {
    return value.test(url.pathname)
  }
}
