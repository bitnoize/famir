import {
  DatabaseError,
  MessageHeaders,
  MessageModel,
  MessageRequestCookies,
  MessageResponseCookies,
  ValidatorAssertSchema
} from '@famir/domain'
import { RawMessage } from './message.functions.js'

export function parseMessageRequestHeaders(
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
      context: {
        data: data
      },
      code: 'UNKNOWN'
    })
  }
}

export function parseMessageRequestCookies(
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
      context: {
        data: data
      },
      code: 'UNKNOWN'
    })
  }
}

export function parseMessageRequestBody(data: string): Buffer {
  try {
    return Buffer.from(data, 'base64')
  } catch (error) {
    throw new DatabaseError(`Parse message request body failed`, {
      cause: error,
      context: {
        data: data.length
      },
      code: 'UNKNOWN'
    })
  }
}

export function parseMessageResponseHeaders(
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
      context: {
        data: data
      },
      code: 'UNKNOWN'
    })
  }
}

export function parseMessageResponseCookies(
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
      context: {
        data: data
      },
      code: 'UNKNOWN'
    })
  }
}

export function parseMessageResponseBody(data: string): Buffer {
  try {
    return Buffer.from(data, 'base64')
  } catch (error) {
    throw new DatabaseError(`Parse message response body failed`, {
      cause: error,
      context: {
        data: data.length
      },
      code: 'UNKNOWN'
    })
  }
}

export function buildMessageModel(
  assertSchema: ValidatorAssertSchema,
  rawMessage: RawMessage | null
): MessageModel | null {
  if (rawMessage === null) {
    return null
  }

  return new MessageModel(
    rawMessage.campaign_id,
    rawMessage.id,
    rawMessage.proxy_id,
    rawMessage.target_id,
    rawMessage.session_id,
    rawMessage.client_ip,
    rawMessage.method,
    rawMessage.origin_url,
    rawMessage.forward_url,
    parseMessageRequestHeaders(assertSchema, rawMessage.request_headers),
    parseMessageRequestCookies(assertSchema, rawMessage.request_cookies),
    parseMessageRequestBody(rawMessage.request_body),
    rawMessage.status_code,
    parseMessageResponseHeaders(assertSchema, rawMessage.response_headers),
    parseMessageResponseCookies(assertSchema, rawMessage.response_cookies),
    parseMessageResponseBody(rawMessage.response_body),
    rawMessage.query_time,
    rawMessage.score,
    new Date(rawMessage.created_at)
  )
}

export function buildMessageCollection(
  assertSchema: ValidatorAssertSchema,
  rawMessages: Array<RawMessage | null>
): Array<MessageModel | null> {
  return rawMessages.map((rawMessage) => buildMessageModel(assertSchema, rawMessage))
}

export function guardMessage(data: MessageModel | null): data is MessageModel {
  return data !== null
}

export function assertMessage(data: MessageModel | null): asserts data is MessageModel {
  if (!guardMessage(data)) {
    throw new Error(`Message lost`)
  }
}
