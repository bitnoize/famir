import { analyzeJobDataSchema } from '@famir/consume'
import { ValidatorSchemas } from '@famir/validator'

/**
 * @category Analyze
 * @internal
 */
export const analyzeSchemas: ValidatorSchemas = {
  'actions-analyze-job-data': analyzeJobDataSchema,
} as const
