import { arrayIncludes } from '@famir/common'
import { HTTP_METHODS, HttpMethod } from '@famir/domain'

export function getMethod(value: string | unknown): HttpMethod {
  return value && arrayIncludes(HTTP_METHODS, value) ? value : 'GET'
}

export function isMethod(method: HttpMethod, value: HttpMethod | HttpMethod[]): boolean {
  if (Array.isArray(value)) {
    return value.includes(method)
  } else {
    return value === method
  }
}
