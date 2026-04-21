import { JSONSchemaType } from '@famir/validator'
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
} from './http-proto.js'

/**
 * @category none
 * @internal
 */
export const httpTypeSchema: JSONSchemaType<HttpType> = {
  type: 'string',
  enum: [...HTTP_TYPES],
} as const

/**
 * @category none
 * @internal
 */
export const httpMethodSchema: JSONSchemaType<HttpMethod> = {
  type: 'string',
  enum: [...HTTP_METHODS],
} as const

/**
 * @category none
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
 * @category none
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
 * @category none
 * @internal
 */
export const httpConnectionSchema: JSONSchemaType<HttpConnection> = {
  type: 'object',
  additionalProperties: {
    anyOf: [{ type: 'number' }, { type: 'string' }],
  },
} as const

/**
 * @category none
 * @internal
 */
export const httpPayloadSchema: JSONSchemaType<HttpPayload> = {
  type: 'object',
  additionalProperties: true,
} as const

/**
 * @category none
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
 * @category none
 * @internal
 */
export const httpErrorsSchema: JSONSchemaType<HttpError[]> = {
  type: 'array',
  items: httpErrorSchema,
} as const
