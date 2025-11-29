import { JSONSchemaType, customIdentSchema, randomIdentSchema } from '@famir/common'
import {
  HttpHeader,
  HttpHeaders,
  HttpLog,
  HttpRequestCookie,
  HttpRequestCookies,
  HttpResponseCookie,
  HttpResponseCookies,
  ReadMessageData
} from '@famir/domain'
import { RawFullMessage, RawMessage } from './message.functions.js'

export const rawMessageSchema: JSONSchemaType<RawMessage> = {
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

export const rawFullMessageSchema: JSONSchemaType<RawFullMessage> = {
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
    'logs',
    'request_headers',
    'request_cookies',
    'request_body',
    'response_headers',
    'response_cookies',
    'response_body',
    'client_ip',
    'status',
    'score',
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
    request_cookies: {
      type: 'string'
    },
    request_body: {
      type: 'string'
    },
    response_headers: {
      type: 'string'
    },
    response_cookies: {
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
    logs: {
      type: 'string'
    },
    created_at: {
      type: 'integer'
    }
  },
  additionalProperties: false
} as const

export const messageLogSchema: JSONSchemaType<HttpLog> = {
  type: 'array',
  items: [
    {
      type: 'string'
    },
    {
      type: 'object'
    }
  ],
  minItems: 2,
  maxItems: 2,
  additionalItems: false
} as const

export const messageLogsSchema: JSONSchemaType<HttpLog[]> = {
  type: 'array',
  items: messageLogSchema
} as const

export const messageHeaderSchema: JSONSchemaType<HttpHeader> = {
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

export const messageHeadersSchema: JSONSchemaType<HttpHeaders> = {
  type: 'object',
  required: [],
  additionalProperties: {
    ...messageHeaderSchema,
    nullable: true
  }
} as const

export const messageRequestCookieSchema: JSONSchemaType<HttpRequestCookie> = {
  type: 'string'
} as const

export const messageRequestCookiesSchema: JSONSchemaType<HttpRequestCookies> = {
  type: 'object',
  required: [],
  additionalProperties: {
    ...messageRequestCookieSchema,
    nullable: true
  }
} as const

export const messageResponseCookieSchema: JSONSchemaType<HttpResponseCookie> = {
  type: 'object',
  required: ['value'],
  properties: {
    value: {
      type: 'string'
    },
    path: {
      type: 'string',
      nullable: true
    },
    domain: {
      type: 'string',
      nullable: true
    },
    expires: {
      type: 'number',
      nullable: true
    },
    maxAge: {
      type: 'number',
      nullable: true
    },
    secure: {
      type: 'boolean',
      nullable: true
    },
    httpOnly: {
      type: 'boolean',
      nullable: true
    },
    sameSite: {
      type: 'string',
      nullable: true
    }
  },
  additionalProperties: false
} as const

export const messageResponseCookiesSchema: JSONSchemaType<HttpResponseCookies> = {
  type: 'object',
  required: [],
  additionalProperties: {
    ...messageResponseCookieSchema,
    nullable: true
  }
} as const

export const readMessageDataSchema: JSONSchemaType<ReadMessageData> = {
  type: 'object',
  required: ['campaignId', 'messageId'],
  properties: {
    campaignId: customIdentSchema,
    messageId: randomIdentSchema
  },
  additionalProperties: false
} as const
