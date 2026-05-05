import {
  httpConnectionSchema,
  httpErrorsSchema,
  httpHeadersSchema,
  httpMethodSchema,
  httpPayloadSchema,
  httpRelativeUrlSchema,
  httpStatusSchema,
  httpTypeSchema,
} from '@famir/http-proto'
import {
  JSONSchemaType,
  ValidatorSchemas,
  customIdentSchema,
  randomIdentSchema,
  serializableSchema,
  timestampSchema,
} from '@famir/validator'
import { RawFullMessage, RawMessage } from './message.functions.js'

/**
 * Schema for validating raw message data from Redis.
 *
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
 * Schema for validating raw full message data from Redis.
 *
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
    request_headers: serializableSchema,
    request_body: serializableSchema,
    status: httpStatusSchema,
    response_headers: serializableSchema,
    response_body: serializableSchema,
    connection: serializableSchema,
    payload: serializableSchema,
    errors: serializableSchema,
    analyze: customIdentSchema,
    start_time: timestampSchema,
    finish_time: timestampSchema,
    created_at: timestampSchema,
  },
  additionalProperties: false,
} as const

/**
 * Collection of all schemas used by the message module.
 *
 * @category Message
 * @internal
 */
export const messageSchemas: ValidatorSchemas = {
  'database-raw-message': rawMessageSchema,
  'database-raw-full-message': rawFullMessageSchema,
  'database-message-headers': httpHeadersSchema,
  'database-message-connection': httpConnectionSchema,
  'database-message-payload': httpPayloadSchema,
  'database-message-errors': httpErrorsSchema,
} as const
