import { JSONSchemaType, customIdentSchema, randomIdentSchema } from '@famir/common'
import {
  HttpHeader,
  HttpHeaders,
  HttpRequestCookie,
  HttpRequestCookies,
  HttpResponseCookie,
  HttpResponseCookies,
  ReadMessageModel
} from '@famir/domain'

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
  required: [],
  properties: {
    value: {
      type: 'string',
      nullable: true
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
      enum: ['strict', 'lax', 'none'],
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

export const readMessageModelSchema: JSONSchemaType<ReadMessageModel> = {
  type: 'object',
  required: ['campaignId', 'messageId'],
  properties: {
    campaignId: customIdentSchema,
    messageId: randomIdentSchema
  },
  additionalProperties: false
} as const
