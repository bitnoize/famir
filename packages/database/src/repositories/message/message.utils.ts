import {
  DatabaseError,
  MessageHeaders,
  MessageModel,
  MessageRequestCookies,
  MessageResponseCookies,
  ValidatorAssertSchema
} from '@famir/domain'
import { RawMessage } from './message.functions.js'

export function parseRequestHeaders(
  assertSchema: ValidatorAssertSchema,
  data: string
): MessageHeaders {
  try {
    const headers: unknown = JSON.parse(data)

    assertSchema<MessageHeaders>('message-headers', headers)

    return headers
  } catch (error) {
    throw new DatabaseError(`Parse message request headers failed`, {
      cause: error,
      code: 'UNKNOWN'
    })
  }
}

export function parseRequestCookies(
  assertSchema: ValidatorAssertSchema,
  data: string
): MessageRequestCookies {
  try {
    const cookies: unknown = JSON.parse(data)

    assertSchema<MessageRequestCookies>('message-request-cookies', cookies)

    return cookies
  } catch (error) {
    throw new DatabaseError(`Parse message request cookies failed`, {
      cause: error,
      code: 'UNKNOWN'
    })
  }
}

export function parseRequestBody(data: string): Buffer {
  try {
    return Buffer.from(data, 'base64')
  } catch (error) {
    throw new DatabaseError(`Parse message request body failed`, {
      cause: error,
      code: 'UNKNOWN'
    })
  }
}

export function parseResponseHeaders(
  assertSchema: ValidatorAssertSchema,
  data: string
): MessageHeaders {
  try {
    const headers: unknown = JSON.parse(data)

    assertSchema<MessageHeaders>('message-headers', headers)

    return headers
  } catch (error) {
    throw new DatabaseError(`Parse message response headers failed`, {
      cause: error,
      code: 'UNKNOWN'
    })
  }
}

export function parseResponseCookies(
  assertSchema: ValidatorAssertSchema,
  data: string
): MessageResponseCookies {
  try {
    const cookies: unknown = JSON.parse(data)

    assertSchema<MessageResponseCookies>('message-response-cookies', cookies)

    return cookies
  } catch (error) {
    throw new DatabaseError(`Parse message response cookies failed`, {
      cause: error,
      code: 'UNKNOWN'
    })
  }
}

export function parseResponseBody(data: string): Buffer {
  try {
    return Buffer.from(data, 'base64')
  } catch (error) {
    throw new DatabaseError(`Parse message response body failed`, {
      cause: error,
      code: 'UNKNOWN'
    })
  }
}

export function buildModel(
  assertSchema: ValidatorAssertSchema,
  raw: RawMessage | null
): MessageModel | null {
  if (raw === null) {
    return null
  }

  return new MessageModel(
    raw.campaign_id,
    raw.message_id,
    raw.proxy_id,
    raw.target_id,
    raw.session_id,
    raw.client_ip,
    raw.method,
    raw.origin_url,
    raw.forward_url,
    parseRequestHeaders(assertSchema, raw.request_headers),
    parseRequestCookies(assertSchema, raw.request_cookies),
    parseRequestBody(raw.request_body),
    raw.status_code,
    parseResponseHeaders(assertSchema, raw.response_headers),
    parseResponseCookies(assertSchema, raw.response_cookies),
    parseResponseBody(raw.response_body),
    raw.query_time,
    raw.score,
    new Date(raw.created_at)
  )
}

export function buildCollection(
  assertSchema: ValidatorAssertSchema,
  raws: Array<RawMessage | null>
): Array<MessageModel | null> {
  return raws.map((raw) => buildModel(assertSchema, raw))
}

export function guardModel(data: MessageModel | null): data is MessageModel {
  return data !== null
}

export function assertModel(data: MessageModel | null): asserts data is MessageModel {
  if (!guardModel(data)) {
    throw new Error(`Message lost`)
  }
}
