import { JSONSchemaType } from '@famir/validator'
import { BullConsumerConfig } from './consumer.js'

/**
 * JSON Schema for validating a Bull consumer connection URL.
 *
 * @category none
 * @internal
 */
const bullConsumerConnectionUrlSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256,
  default: 'redis://localhost:6379',
} as const

/**
 * JSON Schema for validating a Bull consumer key prefix.
 *
 * @category none
 * @internal
 */
const bullConsumerPrefixSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256,
  default: 'bull',
} as const

/**
 * JSON Schema for validating a complete Bull consumer configuration.
 *
 * @category none
 * @internal
 */
export const bullConsumerConfigSchema: JSONSchemaType<BullConsumerConfig> = {
  type: 'object',
  required: ['CONSUMER_CONNECTION_URL', 'CONSUMER_PREFIX'],
  properties: {
    CONSUMER_CONNECTION_URL: bullConsumerConnectionUrlSchema,
    CONSUMER_PREFIX: bullConsumerPrefixSchema,
  },
  additionalProperties: false,
} as const
