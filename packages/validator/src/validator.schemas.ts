import { JSONSchemaType } from './validator.js'

/**
 * Schema for a boolean.
 *
 * @category none
 * @internal
 */
export const booleanSchema: JSONSchemaType<boolean> = {
  type: 'boolean',
} as const

/**
 * Schema for a custom identificator.
 *
 * @category none
 * @internal
 */
export const customIdentSchema: JSONSchemaType<string> = {
  type: 'string',
  pattern: '^[0-9a-zA-Z-_]{1,64}$',
} as const

/**
 * Schema for a random identificator.
 *
 * @category none
 * @internal
 */
export const randomIdentSchema: JSONSchemaType<string> = {
  type: 'string',
  pattern: '^[0-9a-f]{32}$',
} as const

/**
 * Schema for a counter.
 *
 * @category none
 * @internal
 */
export const counterSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 0,
  maximum: Number.MAX_SAFE_INTEGER,
} as const

/**
 * Schema for a timestamp.
 *
 * @category none
 * @internal
 */
export const timestampSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 0,
  maximum: 8640000000000000,
} as const

/**
 * Schema for a serializable data.
 *
 * @category none
 * @internal
 */
export const serializableSchema: JSONSchemaType<string> = {
  type: 'string',
} as const
