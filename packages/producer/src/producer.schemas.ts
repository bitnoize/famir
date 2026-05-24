import { JSONSchemaType } from '@famir/validator'
import { BullProducerConfig } from './producer.js'

/**
 * JSON Schema for validating a Bull producer connection URL.
 *
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
 * JSON Schema for validating a Bull producer key prefix.
 *
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
 * JSON Schema for validating a complete Bull producer configuration.
 *
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
