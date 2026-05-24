import { WebhookJobData } from '@famir/producer'
import { JSONSchemaType } from '@famir/validator'

/**
 * JSON Schema for validating webhook job data.
 *
 * @category Webhook
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
