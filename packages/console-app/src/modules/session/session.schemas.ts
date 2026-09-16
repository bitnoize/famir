import { JSONSchemaType, customIdentSchema, randomIdentSchema } from '@famir/common'
import { ListSessionsArgs, ReadSessionArgs, RevokeSessionArgs } from './session.js'

/**
 * @category Session
 * @internal
 */
export const readSessionArgsSchema: JSONSchemaType<ReadSessionArgs> = {
  type: 'object',
  required: ['_'],
  properties: {
    _: {
      type: 'array',
      items: [customIdentSchema, randomIdentSchema],
      minItems: 2,
      maxItems: 2,
    },
  },
  additionalProperties: false,
} as const

/**
 * @category Session
 * @internal
 */
export const revokeSessionArgsSchema: JSONSchemaType<RevokeSessionArgs> = {
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
 * @category Session
 * @internal
 */
export const listSessionsArgsSchema: JSONSchemaType<ListSessionsArgs> = {
  type: 'object',
  required: ['_', 'limit'],
  properties: {
    _: {
      type: 'array',
      items: [customIdentSchema],
      minItems: 1,
      maxItems: 1,
    },
    limit: {
      type: 'integer',
      minimum: 1,
      maximum: 1000_000,
    },
  },
  additionalProperties: false,
} as const
