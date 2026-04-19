import { WebhookJobData } from '@famir/produce'
import { JSONSchemaType } from '@famir/validator'

/**
 * @category Webhook
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
