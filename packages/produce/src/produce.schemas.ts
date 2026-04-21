import { JSONSchemaType } from '@famir/validator'

/**
 * @category none
 * @internal
 */
export const configRedisProduceConnectionUrlSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128,
  //default: 'redis://localhost:6379/1'
} as const

/**
 * @category none
 * @internal
 */
export const configRedisProducePrefixSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128,
  default: 'bull',
} as const
