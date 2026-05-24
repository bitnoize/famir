import { JSONSchemaType, customIdentSchema, randomIdentSchema } from '@famir/validator'
import { ReadMessageArgs } from './message.js'

/**
 * JSON Schema for validating a read message args.
 *
 * @category Message
 * @internal
 */
export const readMessageArgsSchema: JSONSchemaType<ReadMessageArgs> = {
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
