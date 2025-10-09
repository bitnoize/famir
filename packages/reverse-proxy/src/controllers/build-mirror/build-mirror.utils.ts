import { HttpServerError, ValidatorAssertSchema, ValidatorSchemas } from '@famir/domain'
import { readCampaignTargetDataSchema } from './build-mirror.schemas.js'
import { ReadCampaignTargetData } from './use-cases/index.js'

export const addSchemas: ValidatorSchemas = {
  'read-campaign-target-data': readCampaignTargetDataSchema
}

export function validateReadCampaignTargetData(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is ReadCampaignTargetData {
  try {
    assertSchema<ReadCampaignTargetData>('read-campaign-target-data', data)
  } catch (error) {
    throw new HttpServerError(`ReadCampaignTargetData validation failed`, {
      cause: error,
      code: 'SERVICE_UNAVAILABLE',
      status: 503
    })
  }
}
