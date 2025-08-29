import { JSONSchemaType } from './validator.js'

export const customIdentSchema: JSONSchemaType<string> = {
  type: 'string',
  pattern: '^[0-9a-zA-Z-_]{1,128}$'
} as const

export const randomIdentSchema: JSONSchemaType<string> = {
  type: 'string',
  pattern: '^[0-9a-f]{8,128}$'
} as const

export const simpleBooleanSchema: JSONSchemaType<boolean> = {
  type: 'boolean'
} as const
