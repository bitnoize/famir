import { JSONSchemaType } from '@famir/common'
import { BullProducerConfig } from './producer.js'

const bullProducerConnectionUrlSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256,
  default: 'redis://localhost:6379/1',
} as const

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
