import { AnalyzeJobData } from '@famir/producer'
import { JSONSchemaType, customIdentSchema, randomIdentSchema } from '@famir/validator'

/**
 * JSON Schema for validating analyze job data.
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
