import { JSONSchemaType, customIdentSchema, randomIdentSchema } from '@famir/validator'
import { ReadSessionArgs } from './session.js'

/**
 * JSON Schema for validating a read session args.
 *
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
