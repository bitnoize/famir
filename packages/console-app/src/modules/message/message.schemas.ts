import { JSONSchemaType, customIdentSchema, randomIdentSchema } from '@famir/common'
import { DeleteMessageArgs, ListMessagesArgs, ReadMessageArgs } from './message.js'

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

/**
 * @category Message
 * @internal
 */
export const deleteMessageArgsSchema: JSONSchemaType<DeleteMessageArgs> = {
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
 * @category Message
 * @internal
 */
export const listMessagesArgsSchema: JSONSchemaType<ListMessagesArgs> = {
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
