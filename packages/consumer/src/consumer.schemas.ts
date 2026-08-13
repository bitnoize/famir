import { JSONSchemaType } from '@famir/validator'
import { BullConsumerConfig } from './consumer.js'

/**
 * @category none
 * @internal
 */
const bullConsumerConnectionUrlSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256,
  default: 'redis://localhost:6379/1',
} as const

/**
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
