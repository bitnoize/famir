import { JSONSchemaType } from '@famir/common'

// FIXME
export const lurePathSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128
} as const
