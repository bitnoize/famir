import { JSONSchemaType, customIdentSchema, randomIdentSchema } from '@famir/common'
import { AnalyzeJobData } from '@famir/domain'

/**
 * Validate analyze job data.
 *
 * @category Analyze
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
