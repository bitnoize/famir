import { JSONSchemaType } from '@famir/common'

export const configHttpClientBodyLimitSchema: JSONSchemaType<number> = {
  type: 'number',
  minimum: 1,
  maximum: 1024 * 1024 * 1024,
  default: 10 * 1024 * 1024
} as const
