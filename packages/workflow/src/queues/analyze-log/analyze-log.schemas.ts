import { JSONSchemaType } from '@famir/common'
import { AnalyzeLogJobData } from '@famir/domain'
import { customIdentSchema, randomIdentSchema } from '@famir/validator'

export const analyzeLogJobDataSchema: JSONSchemaType<AnalyzeLogJobData> = {
  type: 'object',
  required: ['campaignId', 'messageId'],
  properties: {
    campaignId: customIdentSchema,
    messageId: randomIdentSchema
  },
  additionalProperties: false
} as const
