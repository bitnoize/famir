import { JSONSchemaType, customIdentSchema, randomIdentSchema } from '@famir/validator'
import { ReadMessageArgs } from './message.js'

/**
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
    showHeaders: {
      type: 'boolean',
    },
    showConnection: {
      type: 'boolean',
    },
    showPayload: {
      type: 'boolean',
    },
  },
  additionalProperties: false,
} as const
