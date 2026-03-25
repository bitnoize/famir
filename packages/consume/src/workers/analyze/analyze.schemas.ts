import { AnalyzeJobData } from '@famir/produce'
import {
  JSONSchemaType,
  ValidatorSchemas,
  customIdentSchema,
  randomIdentSchema
} from '@famir/validator'

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
  'consume-analyze-job-data': analyzeJobDataSchema
} as const
