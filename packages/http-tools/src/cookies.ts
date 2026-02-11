import { HttpCookies, HttpSetCookies } from '@famir/domain'
import { Cookie } from 'tough-cookie'

export function parseCookies(values: string[]): HttpCookies {
  const cookies: HttpCookies = {}

  values
    .join(';')
    .split(';')
    .forEach((rawCookie) => {
      const toughCookie = Cookie.parse(rawCookie.trim())

      if (toughCookie) {
        cookies[toughCookie.key] = toughCookie.value
      }
    })

  return cookies
}

export function formatCookies(cookies: HttpCookies): string {
  const toughCookies: Cookie[] = []

  Object.entries(cookies).forEach(([name, value]) => {
    if (value != null) {
      const toughCookie = new Cookie({
        key: name,
        value: value
      })

      toughCookies.push(toughCookie)
    }
  })

  return toughCookies.map((toughCookie) => toughCookie.cookieString()).join(';')
}

export function parseSetCookies(values: string[]): HttpSetCookies {
  const cookies: HttpSetCookies = {}

  values
    .join(';')
    .split(';')
    .forEach((rawCookie) => {
      const toughCookie = Cookie.parse(rawCookie.trim())

      if (!toughCookie) {
        return
      }

      const name = toughCookie.key

      cookies[name] = {
        value: toughCookie.value
      }

      // tough-cookie expires: Date | 'Infinity' | null
      if (toughCookie.expires instanceof Date) {
        cookies[name].expires = toughCookie.expires.getTime()
      }

      // tough-cookie maxAge: number | 'Infinity' | '-Infinity' | null
      if (typeof toughCookie.maxAge === 'number') {
        cookies[name].maxAge = toughCookie.maxAge
      }

      if (toughCookie.path != null) {
        cookies[name].path = toughCookie.path
      }

      if (toughCookie.domain != null) {
        cookies[name].domain = toughCookie.domain
      }

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (toughCookie.secure != null) {
        cookies[name].secure = toughCookie.secure
      }

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (toughCookie.httpOnly != null) {
        cookies[name].httpOnly = toughCookie.httpOnly
      }

      if (toughCookie.sameSite != null) {
        cookies[name].sameSite = toughCookie.sameSite
      }
    })

  return cookies
}

export function formatSetCookies(cookies: HttpSetCookies): string {
  const toughCookies: Cookie[] = []

  Object.entries(cookies).forEach(([name, cookie]) => {
    if (cookie != null) {
      const toughCookie = new Cookie({
        key: name,
        value: cookie.value
      })

      if (cookie.expires != null) {
        toughCookie.expires = new Date(cookie.expires)
      }

      if (cookie.maxAge != null) {
        toughCookie.maxAge = cookie.maxAge
      }

      if (cookie.path != null) {
        toughCookie.path = cookie.path
      }

      if (cookie.domain != null) {
        toughCookie.domain = cookie.domain
      }

      if (cookie.secure != null) {
        toughCookie.secure = cookie.secure
      }

      if (cookie.httpOnly != null) {
        toughCookie.httpOnly = cookie.httpOnly
      }

      if (cookie.sameSite != null) {
        toughCookie.sameSite = cookie.sameSite
      }

      toughCookies.push(toughCookie)
    }
  })

  return toughCookies.map((toughCookie) => toughCookie.toString()).join(';')
}
