import { JSONSchemaType } from '@famir/validator'

/**
 * @category Schemas
 * @internal
 */
export const configRedisConsumeConnectionUrlSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128,
  //default: 'redis://localhost:6379/1'
} as const

/**
 * @category Schemas
 * @internal
 */
export const configRedisConsumePrefixSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128,
  default: 'bull',
} as const

/**
 * @category Schemas
 * @internal
 */
export const configBullConsumeConcurrencySchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 100,
} as const

/**
 * @category Schemas
 * @internal
 */
export const configBullConsumeLimiterMaxSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 1000,
} as const

/**
 * @category Schemas
 * @internal
 */
export const configBullConsumeLimiterDurationSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 3600 * 1000,
} as const
