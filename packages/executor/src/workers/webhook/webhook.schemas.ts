import { JSONSchemaType, ValidatorSchemas } from '@famir/validator'
import { WebhookJobData } from '@famir/workflow'

export const webhookJobDataSchema: JSONSchemaType<WebhookJobData> = {
  type: 'object',
  required: ['url'],
  properties: {
    url: {
      type: 'string'
    }
  },
  additionalProperties: false
} as const

export const webhookSchemas: ValidatorSchemas = {
  'executor-webhook-job-data': webhookJobDataSchema
} as const
