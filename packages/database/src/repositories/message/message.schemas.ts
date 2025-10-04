import { JSONSchemaType } from '@famir/common'
import {
  MessageHeader,
  MessageHeaders,
  MessageRequestCookie,
  MessageRequestCookies,
  MessageResponseCookie,
  MessageResponseCookies,
  ReadMessageData
} from '@famir/domain'
import { customIdentSchema } from '@famir/validator'

export const messageHeaderSchema: JSONSchemaType<MessageHeader> = {
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

export const messageHeadersSchema: JSONSchemaType<MessageHeaders> = {
  type: 'object',
  required: [],
  additionalProperties: {
    ...messageHeaderSchema,
    nullable: true
  }
} as const

export const messageRequestCookieSchema: JSONSchemaType<MessageRequestCookie> = {
  type: 'string'
} as const

export const messageRequestCookiesSchema: JSONSchemaType<MessageRequestCookies> = {
  type: 'object',
  required: [],
  additionalProperties: {
    ...messageRequestCookieSchema,
    nullable: true
  }
} as const

export const messageResponseCookieSchema: JSONSchemaType<MessageResponseCookie> = {
  type: 'object',
  required: ['name', 'value'],
  properties: {
    name: {
      type: 'string'
    },
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

export const messageResponseCookiesSchema: JSONSchemaType<MessageResponseCookies> = {
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
    messageId: customIdentSchema
  },
  additionalProperties: false
} as const
