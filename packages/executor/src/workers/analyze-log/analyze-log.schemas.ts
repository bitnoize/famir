import {
  JSONSchemaType,
  ValidatorSchemas,
  customIdentSchema,
  randomIdentSchema
} from '@famir/validator'
import { AnalyzeLogJobData } from '@famir/workflow'

export const analyzeLogJobDataSchema: JSONSchemaType<AnalyzeLogJobData> = {
  type: 'object',
  required: ['campaignId', 'messageId'],
  properties: {
    campaignId: customIdentSchema,
    messageId: randomIdentSchema
  },
  additionalProperties: false
} as const

export const analyzeLogSchemas: ValidatorSchemas = {
  'executor-analyze-log-job-data': analyzeLogJobDataSchema
} as const
