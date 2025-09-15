import { JSONSchemaType } from '@famir/common'

export const proxyUrlSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128
} as const
