import { JSONSchemaType } from '@famir/common'

export const configHttpClientVerboseSchema: JSONSchemaType<boolean> = {
  type: 'boolean',
  default: false
} as const
