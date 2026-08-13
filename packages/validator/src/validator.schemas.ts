import { JSONSchemaType } from './validator.js'

/**
 * JSON Schema for validating a boolean value.
 */
export const booleanSchema: JSONSchemaType<boolean> = {
  type: 'boolean',
} as const

/**
 * JSON Schema for validating custom identifiers.
 */
export const customIdentSchema: JSONSchemaType<string> = {
  type: 'string',
  pattern: '^[0-9a-zA-Z-_]{2,64}$',
} as const

/**
 * JSON Schema for validating random identifiers.
 */
export const randomIdentSchema: JSONSchemaType<string> = {
  type: 'string',
  pattern: '^[0-9a-f]{32}$',
} as const

/**
 * JSON Schema for validating a secret value.
 */
export const secretSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 5,
  maxLength: 256,
} as const

/**
 * JSON Schema for validating a counter number.
 */
export const counterSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 0,
  maximum: Number.MAX_SAFE_INTEGER,
} as const

/**
 * JSON Schema for validating a timestamp.
 */
export const timestampSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 0,
  maximum: 8_640_000_000_000_000,
} as const
