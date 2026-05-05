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
 * Schema for validating a HTTP type.
 *
 * @category none
 * @internal
 */
export const httpTypeSchema: JSONSchemaType<HttpType> = {
  type: 'string',
  enum: [...HTTP_TYPES],
} as const

/**
 * Schema for validating a HTTP method.
 *
 * @category none
 * @internal
 */
export const httpMethodSchema: JSONSchemaType<HttpMethod> = {
  type: 'string',
  enum: [...HTTP_METHODS],
} as const

/**
 * Schema for validating a relative URL.
 *
 * @category none
 * @internal
 */
export const httpRelativeUrlSchema: JSONSchemaType<string> = {
  type: 'string',
  //pattern: '^\\/[^\\s]*$'
} as const

/**
 * Schema for validating a response status.
 *
 * @category none
 * @internal
 */
export const httpStatusSchema: JSONSchemaType<number> = {
  type: 'integer',
} as const

/**
 * Schema for validating a single header.
 *
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
 * Schema for validating a headers data.
 *
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
 * Schema for validating a connection data.
 *
 * @category none
 * @internal
 */
export const httpConnectionSchema: JSONSchemaType<HttpConnection> = {
  type: 'object',
  additionalProperties: {
    anyOf: [
      {
        type: 'number',
        nullable: true,
      },
      {
        type: 'string',
        nullable: true,
      },
    ],
  },
} as const

/**
 * Schema for validating a payload data.
 *
 * @category none
 * @internal
 */
export const httpPayloadSchema: JSONSchemaType<HttpPayload> = {
  type: 'object',
  additionalProperties: true,
} as const

/**
 * Schema for validating a single processing error.
 *
 * @category none
 * @internal
 */
export const httpErrorSchema: JSONSchemaType<HttpError> = {
  type: 'array',
  items: [
    {
      type: 'object',
    },
    {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  ],
  minItems: 2,
  maxItems: 2,
} as const

/**
 * Schema for validating an array of processing errors.
 *
 * @category none
 * @internal
 */
export const httpErrorsSchema: JSONSchemaType<HttpError[]> = {
  type: 'array',
  items: httpErrorSchema,
} as const
