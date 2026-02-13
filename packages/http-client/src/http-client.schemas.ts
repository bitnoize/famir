import { JSONSchemaType } from '@famir/validator'

export const configHttpClientVerboseSchema: JSONSchemaType<boolean> = {
  type: 'boolean',
  default: false
} as const
