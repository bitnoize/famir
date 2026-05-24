import { JSONSchemaType, booleanSchema } from '@famir/validator'
import { CleanupDatabaseArgs, LoadDatabaseFunctionsArgs } from './database.js'

/**
 * JSON Schema for validating a load database functions args.
 *
 * @category Database
 * @internal
 */
export const loadDatabaseFunctionsArgsSchema: JSONSchemaType<LoadDatabaseFunctionsArgs> = {
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
    force: booleanSchema,
  },
  additionalProperties: false,
} as const

/**
 * JSON Schema for validating a cleanup database args.
 *
 * @category Database
 * @internal
 */
export const cleanupDatabaseArgsSchema: JSONSchemaType<CleanupDatabaseArgs> = {
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
    force: booleanSchema,
  },
  additionalProperties: false,
} as const
