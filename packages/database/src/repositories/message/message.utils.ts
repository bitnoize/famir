import {
  Message,
  MessageHeaders,
  MessageMethod,
  MessageRequestCookies,
  MessageResponseCookies
} from '@famir/domain'
import { ValidatorAssertSchema } from '@famir/validator'
import { validateJson } from '../../database.utils.js'
import { RawMessage } from './message.functions.js'

export function validateMessageMethod(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is MessageMethod {
  validateJson<MessageMethod>(assertSchema, 'message-method', data, 'messageMethod')
}

export function validateMessageRequestHeaders(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is MessageHeaders {
  validateJson<MessageHeaders>(assertSchema, 'message-headers', data, 'messageRequestHeaders')
}

export function validateMessageRequestCookies(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is MessageRequestCookies {
  validateJson<MessageRequestCookies>(
    assertSchema,
    'message-request-cookies',
    data,
    'messageRequestCookies'
  )
}

export function validateMessageResponseHeaders(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is MessageHeaders {
  validateJson<MessageHeaders>(assertSchema, 'message-headers', data, 'messageResponseHeaders')
}

export function validateMessageResponseCookies(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is MessageResponseCookies {
  validateJson<MessageResponseCookies>(
    assertSchema,
    'message-response-cookies',
    data,
    'messageResponseCookies'
  )
}

export function buildMessageModel(
  assertSchema: ValidatorAssertSchema,
  rawMessage: RawMessage | null
): Message | null {
  if (rawMessage === null) {
    return null
  }

  validateMessageMethod(assertSchema, rawMessage.method)
  validateMessageRequestHeaders(assertSchema, rawMessage.request_headers)
  validateMessageRequestCookies(assertSchema, rawMessage.request_cookies)
  validateMessageResponseHeaders(assertSchema, rawMessage.response_headers)
  validateMessageResponseCookies(assertSchema, rawMessage.response_cookies)

  return new Message(
    rawMessage.id,
    rawMessage.proxy_id,
    rawMessage.target_id,
    rawMessage.session_id,
    rawMessage.client_ip,
    rawMessage.method,
    rawMessage.origin_url,
    rawMessage.forward_url,
    rawMessage.request_headers,
    rawMessage.request_cookies,
    Buffer.from(rawMessage.request_body, 'base64'),
    rawMessage.status_code,
    rawMessage.response_headers,
    rawMessage.response_cookies,
    Buffer.from(rawMessage.response_body, 'base64'),
    rawMessage.query_time,
    rawMessage.score,
    rawMessage.is_complete,
    new Date(rawMessage.created_at),
    new Date(rawMessage.updated_at)
  )
}

export function buildMessageCollection(
  assertSchema: ValidatorAssertSchema,
  rawMessages: Array<RawMessage | null>
): Array<Message | null> {
  return rawMessages.map((rawMessage) => buildMessageModel(assertSchema, rawMessage))
}
