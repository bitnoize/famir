import { JSONSchemaType } from '@famir/validator'

export const redirectorIdSchema: JSONSchemaType<string> = {
  type: 'string'
  //pattern: customIdentRegExp
} as const

export const redirectorPageSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 0,
  maxLength: 10485760
} as const
