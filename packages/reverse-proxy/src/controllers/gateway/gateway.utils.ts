import { HttpServerError } from '@famir/http-server'

export function validateRequestTargetId(data: unknown, entry: string): asserts data is string {
  const ok = data != null && typeof data === 'string' && data.match(/^[0-9a-zA-Z-_]{1,128}$/)

  if (!ok) {
    throw new HttpServerError(
      503,
      {
        data,
        entry,
        reason: `Request targetId malformed`
      },
      `Server not configured`
    )
  }
}
