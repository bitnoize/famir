import { JSONSchemaType } from '@famir/common'
import { HttpConnection, HttpHeader, HttpHeaders, ValidatorSchemas } from '@famir/domain'
import { RawFullMessage, RawMessage } from './message.functions.js'

const rawMessageSchema: JSONSchemaType<RawMessage> = {
  type: 'object',
  required: [
    'campaign_id',
    'message_id',
    'proxy_id',
    'target_id',
    'session_id',
    'method',
    'url',
    'is_streaming',
    'status',
    'score',
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
    method: {
      type: 'string'
    },
    url: {
      type: 'string'
    },
    is_streaming: {
      type: 'integer'
    },
    status: {
      type: 'integer'
    },
    score: {
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
    'method',
    'url',
    'is_streaming',
    'request_headers',
    'request_body',
    'response_headers',
    'response_body',
    'client_ip',
    'status',
    'score',
    'start_time',
    'finish_time',
    'connection',
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
    method: {
      type: 'string'
    },
    url: {
      type: 'string'
    },
    is_streaming: {
      type: 'integer'
    },
    request_headers: {
      type: 'string'
    },
    request_body: {
      type: 'string'
    },
    response_headers: {
      type: 'string'
    },
    response_body: {
      type: 'string'
    },
    client_ip: {
      type: 'string'
    },
    status: {
      type: 'integer'
    },
    score: {
      type: 'integer'
    },
    start_time: {
      type: 'integer'
    },
    finish_time: {
      type: 'integer'
    },
    connection: {
      type: 'string'
    },
    created_at: {
      type: 'integer'
    }
  },
  additionalProperties: false
} as const

const messageHeaderSchema: JSONSchemaType<HttpHeader> = {
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

const messageHeadersSchema: JSONSchemaType<HttpHeaders> = {
  type: 'object',
  required: [],
  additionalProperties: {
    ...messageHeaderSchema,
    nullable: true
  }
} as const

const messageConnectionSchema: JSONSchemaType<HttpConnection> = {
  type: 'object',
  required: [],
  properties: {
    total_time: {
      type: 'integer',
      nullable: true
    },
    connect_time: {
      type: 'integer',
      nullable: true
    },
    http_version: {
      type: 'integer',
      nullable: true
    }
  },
  additionalProperties: false
} as const

export const messageSchemas: ValidatorSchemas = {
  'database-raw-message': rawMessageSchema,
  'database-raw-full-message': rawFullMessageSchema,
  'database-message-headers': messageHeadersSchema,
  'database-message-connection': messageConnectionSchema
} as const
