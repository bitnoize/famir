import { JSONSchemaType } from '@famir/validator'

export const redirectorPageSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 0,
  maxLength: 10485760
} as const
