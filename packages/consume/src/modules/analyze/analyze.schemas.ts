import { AnalyzeJobData } from '@famir/produce'
import { JSONSchemaType, customIdentSchema, randomIdentSchema } from '@famir/validator'

/**
 * @category Analyze
 * @internal
 */
export const analyzeJobDataSchema: JSONSchemaType<AnalyzeJobData> = {
  type: 'object',
  required: ['campaignId', 'messageId'],
  properties: {
    campaignId: customIdentSchema,
    messageId: randomIdentSchema,
  },
  additionalProperties: false,
} as const
