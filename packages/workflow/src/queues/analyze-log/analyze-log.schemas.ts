import {
  JSONSchemaType,
  ValidatorSchemas,
  customIdentSchema,
  randomIdentSchema
} from '@famir/validator'
import { AnalyzeLogJobData } from './analyze-log.js'

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
