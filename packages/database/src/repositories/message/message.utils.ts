import {
  DatabaseError,
  MessageHeaders,
  MessageModel,
  MessageRequestCookies,
  MessageResponseCookies,
  ValidatorAssertSchema,
  ValidatorSchemas
} from '@famir/domain'
import { RawMessage } from './message.functions.js'
import {
  messageHeadersSchema,
  messageRequestCookiesSchema,
  messageResponseCookiesSchema
} from './message.schemas.js'

export const addSchemas: ValidatorSchemas = {
  'message-headers': messageHeadersSchema,
  'message-request-cookies': messageRequestCookiesSchema,
  'message-response-cookies': messageResponseCookiesSchema
}

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
      code: 'INTERNAL_ERROR'
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
      code: 'INTERNAL_ERROR'
    })
  }
}

export function parseRequestBody(data: string): Buffer {
  try {
    return Buffer.from(data, 'base64')
  } catch (error) {
    throw new DatabaseError(`Parse message request body failed`, {
      cause: error,
      code: 'INTERNAL_ERROR'
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
      code: 'INTERNAL_ERROR'
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
      code: 'INTERNAL_ERROR'
    })
  }
}

export function parseResponseBody(data: string): Buffer {
  try {
    return Buffer.from(data, 'base64')
  } catch (error) {
    throw new DatabaseError(`Parse message response body failed`, {
      cause: error,
      code: 'INTERNAL_ERROR'
    })
  }
}

export function buildModel(
  assertSchema: ValidatorAssertSchema,
  raw: RawMessage | null
): MessageModel | null {
  if (!raw) {
    return null
  }

  return {
    campaignId: raw.campaign_id,
    messageId: raw.message_id,
    proxyId: raw.proxy_id,
    targetId: raw.target_id,
    sessionId: raw.session_id,
    clientIp: raw.client_ip,
    method: raw.method,
    originUrl: raw.origin_url,
    forwardUrl: raw.forward_url,
    requestHeaders: parseRequestHeaders(assertSchema, raw.request_headers),
    requestCookies: parseRequestCookies(assertSchema, raw.request_cookies),
    requestBody: parseRequestBody(raw.request_body),
    status: raw.status,
    responseHeaders: parseResponseHeaders(assertSchema, raw.response_headers),
    responseCookies: parseResponseCookies(assertSchema, raw.response_cookies),
    responseBody: parseResponseBody(raw.response_body),
    queryTime: raw.query_time,
    score: raw.score,
    createdAt: new Date(raw.created_at)
  }
}

export function buildCollection(
  assertSchema: ValidatorAssertSchema,
  raws: Array<RawMessage | null>
): Array<MessageModel | null> {
  return raws.map((raw) => buildModel(assertSchema, raw))
}

export function guardModel(model: MessageModel | null): model is MessageModel {
  return model !== null
}

export function assertModel(model: MessageModel | null): asserts model is MessageModel {
  if (!guardModel(model)) {
    throw new Error(`Message lost`)
  }
}
