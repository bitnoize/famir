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
 * JSON Schema for validating an HTTP type.
 */
export const httpTypeSchema: JSONSchemaType<HttpType> = {
  type: 'string',
  enum: [...HTTP_TYPES],
} as const

/**
 * JSON Schema for validating an HTTP method.
 */
export const httpMethodSchema: JSONSchemaType<HttpMethod> = {
  type: 'string',
  enum: [...HTTP_METHODS],
} as const

/**
 * JSON Schema for validating a relative URL.
 */
export const httpRelativeUrlSchema: JSONSchemaType<string> = {
  type: 'string',
  //pattern: '^\\/[^\\s]*$'
} as const

/**
 * JSON Schema for validating an HTTP response status.
 */
export const httpStatusSchema: JSONSchemaType<number> = {
  type: 'integer',
} as const

/**
 * JSON Schema for validating a single HTTP header.
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
 * JSON Schema for validating an HTTP headers object.
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
 * JSON Schema for validating connection details.
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
 * JSON Schema for validating payload data.
 */
export const httpPayloadSchema: JSONSchemaType<HttpPayload> = {
  type: 'object',
  additionalProperties: true,
} as const

/**
 * JSON Schema for validating a single processing error.
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
 * JSON Schema for validating a list of processing errors.
 */
export const httpErrorsSchema: JSONSchemaType<HttpError[]> = {
  type: 'array',
  items: httpErrorSchema,
} as const
