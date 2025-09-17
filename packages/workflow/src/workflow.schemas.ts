import { JSONSchemaType } from '@famir/common'
import { ValidatorSchemas } from '@famir/domain'

export const configWorkflowConnectionUrlSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128,
  default: 'redis://localhost:6379/1'
} as const

export const configWorkflowPrefixSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128,
  default: 'bull'
} as const

export const workflowSchemas: ValidatorSchemas = {}
