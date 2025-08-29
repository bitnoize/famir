import {
  MESSAGE_METHODS,
  MessageHeader,
  MessageHeaders,
  MessageMethod,
  MessageRequestCookie,
  MessageRequestCookies,
  MessageResponseCookie,
  MessageResponseCookies
} from '@famir/domain'
import { JSONSchemaType } from '@famir/validator'
//import { randomIdentRegExp } from '../../database.utils.js'

export const messageIdSchema: JSONSchemaType<string> = {
  type: 'string'
  //pattern: randomIdentRegExp
} as const

export const messageMethodSchema: JSONSchemaType<MessageMethod> = {
  type: 'string',
  enum: MESSAGE_METHODS
} as const

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
