import {
  JSONSchemaType,
  ValidatorSchemas,
  customIdentSchema,
  randomIdentSchema
} from '@famir/validator'
import { AnalyzeJobData } from '@famir/workflow'

export const analyzeJobDataSchema: JSONSchemaType<AnalyzeJobData> = {
  type: 'object',
  required: ['campaignId', 'messageId'],
  properties: {
    campaignId: customIdentSchema,
    messageId: randomIdentSchema
  },
  additionalProperties: false
} as const

export const analyzeSchemas: ValidatorSchemas = {
  'executor-analyze-job-data': analyzeJobDataSchema
} as const
