import { JSONSchemaType } from '@famir/common'
import { ValidatorSchemas } from '@famir/validator'
import {
  MessageConnection,
  MessageError,
  MessageHeader,
  MessageHeaders,
  MessagePayload
} from '../../models/index.js'
import { RawFullMessage, RawMessage } from './message.functions.js'

const rawMessageSchema: JSONSchemaType<RawMessage> = {
  type: 'object',
  required: [
    'campaign_id',
    'message_id',
    'proxy_id',
    'target_id',
    'session_id',
    'kind',
    'method',
    'url',
    'status',
    'score',
    'ip',
    'start_time',
    'finish_time',
    'created_at'
  ],
  properties: {
    campaign_id: {
      type: 'string'
    },
    message_id: {
      type: 'string'
    },
    proxy_id: {
      type: 'string'
    },
    target_id: {
      type: 'string'
    },
    session_id: {
      type: 'string'
    },
    kind: {
      type: 'string'
    },
    method: {
      type: 'string'
    },
    url: {
      type: 'string'
    },
    status: {
      type: 'integer'
    },
    score: {
      type: 'integer'
    },
    ip: {
      type: 'string'
    },
    start_time: {
      type: 'integer'
    },
    finish_time: {
      type: 'integer'
    },
    created_at: {
      type: 'integer'
    }
  },
  additionalProperties: false
} as const

const rawFullMessageSchema: JSONSchemaType<RawFullMessage> = {
  type: 'object',
  required: [
    'campaign_id',
    'message_id',
    'proxy_id',
    'target_id',
    'session_id',
    'kind',
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
    'score',
    'ip',
    'start_time',
    'finish_time',
    'created_at'
  ],
  properties: {
    campaign_id: {
      type: 'string'
    },
    message_id: {
      type: 'string'
    },
    proxy_id: {
      type: 'string'
    },
    target_id: {
      type: 'string'
    },
    session_id: {
      type: 'string'
    },
    kind: {
      type: 'string'
    },
    method: {
      type: 'string'
    },
    url: {
      type: 'string'
    },
    request_headers: {
      type: 'string'
    },
    request_body: {
      type: 'string'
    },
    status: {
      type: 'integer'
    },
    response_headers: {
      type: 'string'
    },
    response_body: {
      type: 'string'
    },
    connection: {
      type: 'string'
    },
    payload: {
      type: 'string'
    },
    errors: {
      type: 'string'
    },
    score: {
      type: 'integer'
    },
    ip: {
      type: 'string'
    },
    start_time: {
      type: 'integer'
    },
    finish_time: {
      type: 'integer'
    },
    created_at: {
      type: 'integer'
    }
  },
  additionalProperties: false
} as const

const messageHeaderSchema: JSONSchemaType<MessageHeader> = {
  type: ['string', 'array'],
  oneOf: [
    {
      type: 'string'
    },
    {
      type: 'array',
      items: {
        type: 'string'
      }
    }
  ]
} as const

const messageHeadersSchema: JSONSchemaType<MessageHeaders> = {
  type: 'object',
  required: [],
  additionalProperties: {
    ...messageHeaderSchema,
    nullable: true
  }
} as const

const messageConnectionSchema: JSONSchemaType<MessageConnection> = {
  type: 'object',
  additionalProperties: {
    anyOf: [{ type: 'number' }, { type: 'string' }]
  }
} as const

const messagePayloadSchema: JSONSchemaType<MessagePayload> = {
  type: 'object',
  additionalProperties: true
} as const

const messageErrorSchema: JSONSchemaType<MessageError> = {
  type: 'array',
  minItems: 1,
  maxItems: 10,
  items: [
    {
      type: 'object'
    }
  ],
  additionalItems: {
    type: 'string'
  }
} as const

const messageErrorsSchema: JSONSchemaType<MessageError[]> = {
  type: 'array',
  items: messageErrorSchema
} as const

export const messageSchemas: ValidatorSchemas = {
  'database-raw-message': rawMessageSchema,
  'database-raw-full-message': rawFullMessageSchema,
  'database-message-headers': messageHeadersSchema,
  'database-message-connection': messageConnectionSchema,
  'database-message-payload': messagePayloadSchema,
  'database-message-errors': messageErrorsSchema
} as const
