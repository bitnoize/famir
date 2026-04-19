import {
  HTTP_METHODS,
  HTTP_TYPES,
  HttpConnection,
  HttpError,
  HttpHeader,
  HttpHeaders,
  HttpMethod,
  HttpPayload,
  HttpType,
} from '@famir/common'
import { JSONSchemaType } from './validator.js'

/**
 * @category Schemas
 * @internal
 */
export const booleanSchema: JSONSchemaType<boolean> = {
  type: 'boolean',
} as const

/**
 * @category Schemas
 * @internal
 */
export const customIdentSchema: JSONSchemaType<string> = {
  type: 'string',
  pattern: '^[0-9a-zA-Z-_]{1,64}$',
} as const

/**
 * @category Schemas
 * @internal
 */
export const randomIdentSchema: JSONSchemaType<string> = {
  type: 'string',
  pattern: '^[0-9a-f]{32}$',
} as const

/**
 * @category Schemas
 * @internal
 */
export const httpTypeSchema: JSONSchemaType<HttpType> = {
  type: 'string',
  enum: [...HTTP_TYPES],
} as const

/**
 * @category Schemas
 * @internal
 */
export const httpMethodSchema: JSONSchemaType<HttpMethod> = {
  type: 'string',
  enum: [...HTTP_METHODS],
} as const

/**
 * @category Schemas
 * @internal
 */
export const httpHeaderSchema: JSONSchemaType<HttpHeader> = {
  type: ['string', 'array'],
  oneOf: [
    {
      type: 'string',
    },
    {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  ],
} as const

/**
 * @category Schemas
 * @internal
 */
export const httpHeadersSchema: JSONSchemaType<HttpHeaders> = {
  type: 'object',
  required: [],
  additionalProperties: {
    ...httpHeaderSchema,
    nullable: true,
  },
} as const

/**
 * @category Schemas
 * @internal
 */
export const httpConnectionSchema: JSONSchemaType<HttpConnection> = {
  type: 'object',
  additionalProperties: {
    anyOf: [{ type: 'number' }, { type: 'string' }],
  },
} as const

/**
 * @category Schemas
 * @internal
 */
export const httpPayloadSchema: JSONSchemaType<HttpPayload> = {
  type: 'object',
  additionalProperties: true,
} as const

/**
 * @category Schemas
 * @internal
 */
export const httpErrorSchema: JSONSchemaType<HttpError> = {
  type: 'array',
  minItems: 1,
  maxItems: 10,
  items: [
    {
      type: 'object',
    },
  ],
  additionalItems: {
    type: 'string',
  },
} as const

/**
 * @category Schemas
 * @internal
 */
export const httpErrorsSchema: JSONSchemaType<HttpError[]> = {
  type: 'array',
  items: httpErrorSchema,
} as const
