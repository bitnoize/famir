import { JSONSchemaType, customIdentSchema } from '@famir/validator'
import { ListRedirectorsArgs, ReadRedirectorArgs } from './redirector.js'

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
