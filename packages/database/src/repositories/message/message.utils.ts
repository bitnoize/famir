import {
  Message,
  MessageHeaders,
  MessageMethod,
  MessageRequestCookies,
  MessageResponseCookies,
  ValidatorAssertSchema
} from '@famir/domain'
import { RawMessage } from './message.functions.js'

export function buildMessageModel(
  assertSchema: ValidatorAssertSchema,
  rawMessage: RawMessage | null
): Message | null {
  if (rawMessage === null) {
    return null
  }

  assertSchema<MessageMethod>('message-method', rawMessage.method)
  assertSchema<MessageHeaders>('message-headers', rawMessage.request_headers)
  assertSchema<MessageRequestCookies>('message-request-cookies', rawMessage.request_cookies)
  assertSchema<MessageHeaders>('message-headers', rawMessage.response_headers)
  assertSchema<MessageResponseCookies>('message-response-cookies', rawMessage.response_cookies)

  return new Message(
    rawMessage.campaign_id,
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
    new Date(rawMessage.created_at)
  )
}

export function buildMessageCollection(
  assertSchema: ValidatorAssertSchema,
  rawMessages: Array<RawMessage | null>
): Array<Message | null> {
  return rawMessages.map((rawMessage) => buildMessageModel(assertSchema, rawMessage))
}

export function guardMessage(data: Message | null): data is Message {
  return data !== null
}

export function assertMessage(data: Message | null): asserts data is Message {
  if (!guardMessage(data)) {
    throw new Error(`Message lost`)
  }
}
