import { JSONSchemaType } from '@famir/common'
import { PersistLogJobData } from '@famir/domain'
import { customIdentSchema, randomIdentSchema } from '@famir/validator'

export const persistLogJobDataSchema: JSONSchemaType<PersistLogJobData> = {
  type: 'object',
  required: ['campaignId', 'messageId'],
  properties: {
    campaignId: customIdentSchema,
    messageId: randomIdentSchema
  },
  additionalProperties: false
} as const
