import { redirectorFieldSchema } from '@famir/database'
import { JSONSchemaType, customIdentSchema, randomIdentSchema } from '@famir/validator'
import {
  AlterRedirectorFieldArgs,
  CreateRedirectorArgs,
  DeleteRedirectorArgs,
  ListRedirectorsArgs,
  ReadRedirectorArgs,
  UpdateRedirectorArgs,
} from './redirector.js'

/**
 * JSON Schema for validating a create redirector args.
 *
 * @category Redirector
 * @internal
 */
export const createRedirectorArgsSchema: JSONSchemaType<CreateRedirectorArgs> = {
  type: 'object',
  required: ['_', 'lockSecret'],
  properties: {
    _: {
      type: 'array',
      items: [customIdentSchema, customIdentSchema],
      minItems: 2,
      maxItems: 2,
    },
    pageFile: {
      type: 'string',
      nullable: true,
    },
    lockSecret: randomIdentSchema,
  },
  additionalProperties: false,
} as const

/**
 * JSON Schema for validating a read redirector args.
 *
 * @category Redirector
 * @internal
 */
export const readRedirectorArgsSchema: JSONSchemaType<ReadRedirectorArgs> = {
  type: 'object',
  required: ['_'],
  properties: {
    _: {
      type: 'array',
      items: [customIdentSchema, customIdentSchema],
      minItems: 2,
      maxItems: 2,
    },
  },
  additionalProperties: false,
} as const

/**
 * JSON Schema for validating an update redirector args.
 *
 * @category Redirector
 * @internal
 */
export const updateRedirectorArgsSchema: JSONSchemaType<UpdateRedirectorArgs> = {
  type: 'object',
  required: ['_', 'lockSecret'],
  properties: {
    _: {
      type: 'array',
      items: [customIdentSchema, customIdentSchema],
      minItems: 2,
      maxItems: 2,
    },
    pageFile: {
      type: 'string',
      nullable: true,
    },
    lockSecret: randomIdentSchema,
  },
  additionalProperties: false,
} as const

/**
 * JSON Schema for validating an alter redirector field args.
 *
 * @category Redirector
 * @internal
 */
export const alterRedirectorFieldArgsSchema: JSONSchemaType<AlterRedirectorFieldArgs> = {
  type: 'object',
  required: ['_', 'field', 'lockSecret'],
  properties: {
    _: {
      type: 'array',
      items: [customIdentSchema, customIdentSchema],
      minItems: 2,
      maxItems: 2,
    },
    field: redirectorFieldSchema,
    lockSecret: randomIdentSchema,
  },
  additionalProperties: false,
} as const

/**
 * JSON Schema for validating a delete redirector args.
 *
 * @category Redirector
 * @internal
 */
export const deleteRedirectorArgsSchema: JSONSchemaType<DeleteRedirectorArgs> = {
  type: 'object',
  required: ['_', 'lockSecret'],
  properties: {
    _: {
      type: 'array',
      items: [customIdentSchema, customIdentSchema],
      minItems: 2,
      maxItems: 2,
    },
    lockSecret: randomIdentSchema,
  },
  additionalProperties: false,
} as const

/**
 * JSON Schema for validating a list redirectors args.
 *
 * @category Redirector
 * @internal
 */
export const listRedirectorsArgsSchema: JSONSchemaType<ListRedirectorsArgs> = {
  type: 'object',
  required: ['_'],
  properties: {
    _: {
      type: 'array',
      items: [customIdentSchema],
      minItems: 1,
      maxItems: 1,
    },
  },
  additionalProperties: false,
} as const
