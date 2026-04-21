import {
  httpConnectionSchema,
  httpErrorsSchema,
  httpHeadersSchema,
  httpMethodSchema,
  httpPayloadSchema,
  httpTypeSchema,
} from '@famir/http-proto'
import { JSONSchemaType, ValidatorSchemas } from '@famir/validator'
import { RawFullMessage, RawMessage } from './message.functions.js'

/**
 * @category Message
 * @internal
 */
const rawMessageSchema: JSONSchemaType<RawMessage> = {
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
    'processor',
    'start_time',
    'finish_time',
    'created_at',
  ],
  properties: {
    campaign_id: {
      type: 'string',
    },
    message_id: {
      type: 'string',
    },
    proxy_id: {
      type: 'string',
    },
    target_id: {
      type: 'string',
    },
    session_id: {
      type: 'string',
    },
    type: {
      type: 'string',
    },
    method: {
      type: 'string',
    },
    url: {
      type: 'string',
    },
    status: {
      type: 'integer',
    },
    processor: {
      type: 'string',
    },
    start_time: {
      type: 'integer',
    },
    finish_time: {
      type: 'integer',
    },
    created_at: {
      type: 'integer',
    },
  },
  additionalProperties: false,
} as const

/**
 * @category Message
 * @internal
 */
const rawFullMessageSchema: JSONSchemaType<RawFullMessage> = {
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
    'processor',
    'start_time',
    'finish_time',
    'created_at',
  ],
  properties: {
    campaign_id: {
      type: 'string',
    },
    message_id: {
      type: 'string',
    },
    proxy_id: {
      type: 'string',
    },
    target_id: {
      type: 'string',
    },
    session_id: {
      type: 'string',
    },
    type: {
      type: 'string',
    },
    method: {
      type: 'string',
    },
    url: {
      type: 'string',
    },
    request_headers: {
      type: 'string',
    },
    request_body: {
      type: 'string',
    },
    status: {
      type: 'integer',
    },
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
    processor: {
      type: 'string',
    },
    start_time: {
      type: 'integer',
    },
    finish_time: {
      type: 'integer',
    },
    created_at: {
      type: 'integer',
    },
  },
  additionalProperties: false,
} as const

/**
 * @category Message
 * @internal
 */
export const messageSchemas: ValidatorSchemas = {
  'database-raw-message': rawMessageSchema,
  'database-raw-full-message': rawFullMessageSchema,
  'database-message-type': httpTypeSchema,
  'database-message-method': httpMethodSchema,
  'database-message-headers': httpHeadersSchema,
  'database-message-connection': httpConnectionSchema,
  'database-message-payload': httpPayloadSchema,
  'database-message-errors': httpErrorsSchema,
} as const
