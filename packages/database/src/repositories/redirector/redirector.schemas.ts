import { JSONSchemaType } from '@famir/common'

export const redirectorPageSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 0,
  maxLength: 10485760
} as const
