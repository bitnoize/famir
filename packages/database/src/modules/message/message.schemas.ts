import {
  httpMethodSchema,
  httpRelativeUrlSchema,
  httpStatusSchema,
  httpTypeSchema,
} from '@famir/http-proto'
import {
  JSONSchemaType,
  customIdentSchema,
  randomIdentSchema,
  timestampSchema,
} from '@famir/validator'
import { RawFullMessage, RawMessage } from './message.functions.js'

/**
 * @category Message
 * @internal
 */
export const rawMessageSchema: JSONSchemaType<RawMessage> = {
  type: 'object',
  required: [
    'campaign_id',
    'message_id',
    'proxy_id',
    'target_id',
    'session_id',
    'type',
    'method',
    'url',
    'status',
    'analyze',
    'start_time',
    'finish_time',
    'created_at',
  ],
  properties: {
    campaign_id: customIdentSchema,
    message_id: randomIdentSchema,
    proxy_id: customIdentSchema,
    target_id: customIdentSchema,
    session_id: randomIdentSchema,
    type: httpTypeSchema,
    method: httpMethodSchema,
    url: httpRelativeUrlSchema,
    status: httpStatusSchema,
    analyze: customIdentSchema,
    start_time: timestampSchema,
    finish_time: timestampSchema,
    created_at: timestampSchema,
  },
  additionalProperties: false,
} as const

/**
 * @category Message
 * @internal
 */
export const rawFullMessageSchema: JSONSchemaType<RawFullMessage> = {
  type: 'object',
  required: [
    'campaign_id',
    'message_id',
    'proxy_id',
    'target_id',
    'session_id',
    'type',
    'method',
    'url',
    'request_headers',
    'request_body',
    'status',
    'response_headers',
    'response_body',
    'connection',
    'payload',
    'errors',
    'analyze',
    'start_time',
    'finish_time',
    'created_at',
  ],
  properties: {
    campaign_id: customIdentSchema,
    message_id: randomIdentSchema,
    proxy_id: customIdentSchema,
    target_id: customIdentSchema,
    session_id: randomIdentSchema,
    type: httpTypeSchema,
    method: httpMethodSchema,
    url: httpRelativeUrlSchema,
    request_headers: {
      type: 'string',
    },
    request_body: {
      type: 'string',
    },
    status: httpStatusSchema,
    response_headers: {
      type: 'string',
    },
    response_body: {
      type: 'string',
    },
    connection: {
      type: 'string',
    },
    payload: {
      type: 'string',
    },
    errors: {
      type: 'string',
    },
    analyze: {
      type: 'string',
    },
    start_time: timestampSchema,
    finish_time: timestampSchema,
    created_at: timestampSchema,
  },
  additionalProperties: false,
} as const
