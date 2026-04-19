import { WebhookJobData } from '@famir/produce'
import { JSONSchemaType, ValidatorSchemas } from '@famir/validator'

/**
 * @category Schemas
 * @internal
 */
export const webhookJobDataSchema: JSONSchemaType<WebhookJobData> = {
  type: 'object',
  required: ['url'],
  properties: {
    url: {
      type: 'string',
    },
  },
  additionalProperties: false,
} as const

/**
 * @category Workers
 * @internal
 */
export const webhookSchemas: ValidatorSchemas = {
  'consume-webhook-job-data': webhookJobDataSchema,
} as const
