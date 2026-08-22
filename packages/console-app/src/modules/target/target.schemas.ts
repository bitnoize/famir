import { JSONSchemaType, customIdentSchema } from '@famir/validator'
import { ListTargetsArgs, ReadTargetArgs, ReadTargetHostsArgs } from './target.js'

/**
 * JSON Schema for validating a read target args.
 *
 * @category Target
 * @internal
 */
export const readTargetArgsSchema: JSONSchemaType<ReadTargetArgs> = {
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
 * JSON Schema for validating a read target hosts args.
 *
 * @category Target
 * @internal
 */
export const readTargetHostsArgsSchema: JSONSchemaType<ReadTargetHostsArgs> = {
  type: 'object',
  required: ['_'],
  properties: {
    _: {
      type: 'array',
      items: {
        type: 'string',
      },
      minItems: 0,
      maxItems: 0,
    },
  },
  additionalProperties: false,
} as const

/**
 * JSON Schema for validating a list targets args.
 *
 * @category Target
 * @internal
 */
export const listTargetsArgsSchema: JSONSchemaType<ListTargetsArgs> = {
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
