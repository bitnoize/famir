import { JSONSchemaType } from '@famir/common'
import { WebhookJobData } from '@famir/domain'

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
