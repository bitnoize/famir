import { JSONSchemaType } from '@famir/common'

export const configRedisWorkflowConnectionUrlSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128,
  default: 'redis://localhost:6379/1'
} as const

export const configRedisWorkflowPrefixSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128,
  default: 'bull'
} as const
