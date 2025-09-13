import { JSONSchemaType } from '@famir/validator'

// FIXME
export const lurePathSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128
} as const
