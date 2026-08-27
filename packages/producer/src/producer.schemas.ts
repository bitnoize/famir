import { JSONSchemaType } from '@famir/validator'
import { BullProducerConfig } from './producer.js'

/**
 * @category none
 * @internal
 */
const bullProducerConnectionUrlSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256,
  default: 'redis://localhost:6379',
} as const

/**
 * @category none
 * @internal
 */
const bullProducerPrefixSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256,
  default: 'bull',
} as const

/**
 * @category none
 * @internal
 */
export const bullProducerConfigSchema: JSONSchemaType<BullProducerConfig> = {
  type: 'object',
  required: ['PRODUCER_CONNECTION_URL', 'PRODUCER_PREFIX'],
  properties: {
    PRODUCER_CONNECTION_URL: bullProducerConnectionUrlSchema,
    PRODUCER_PREFIX: bullProducerPrefixSchema,
  },
  additionalProperties: false,
} as const
