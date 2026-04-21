import { JSONSchemaType } from './validator.js'

/**
 * @category none
 * @internal
 */
export const booleanSchema: JSONSchemaType<boolean> = {
  type: 'boolean',
} as const

/**
 * @category none
 * @internal
 */
export const customIdentSchema: JSONSchemaType<string> = {
  type: 'string',
  pattern: '^[0-9a-zA-Z-_]{1,64}$',
} as const

/**
 * @category none
 * @internal
 */
export const randomIdentSchema: JSONSchemaType<string> = {
  type: 'string',
  pattern: '^[0-9a-f]{32}$',
} as const
