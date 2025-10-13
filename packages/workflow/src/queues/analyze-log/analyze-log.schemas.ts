import { JSONSchemaType, customIdentSchema, randomIdentSchema } from '@famir/common'
import { AnalyzeLogJobData } from '@famir/domain'

export const analyzeLogJobDataSchema: JSONSchemaType<AnalyzeLogJobData> = {
  type: 'object',
  required: ['campaignId', 'messageId'],
  properties: {
    campaignId: customIdentSchema,
    messageId: randomIdentSchema
  },
  additionalProperties: false
} as const
