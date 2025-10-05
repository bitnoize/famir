import {
  createCampaignDataSchema,
  deleteCampaignDataSchema,
  readCampaignDataSchema,
  updateCampaignDataSchema
} from '@famir/database'
import {
  CreateCampaignData,
  DeleteCampaignData,
  ReadCampaignData,
  ReplServerError,
  UpdateCampaignData,
  ValidatorAssertSchema,
  ValidatorSchemas
} from '@famir/domain'

export const addSchemas: ValidatorSchemas = {
  'create-campaign-data': createCampaignDataSchema,
  'read-campaign-data': readCampaignDataSchema,
  'update-campaign-data': updateCampaignDataSchema,
  'delete-campaign-data': deleteCampaignDataSchema
}
export function validateCreateCampaignData(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is CreateCampaignData {
  try {
    assertSchema<CreateCampaignData>('create-campaign-data', data)
  } catch (error) {
    throw new ReplServerError(`CreateCampaignData validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}

export function validateReadCampaignData(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is ReadCampaignData {
  try {
    assertSchema<ReadCampaignData>('read-campaign-data', data)
  } catch (error) {
    throw new ReplServerError(`ReadCampaignData validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}

export function validateUpdateCampaignData(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is UpdateCampaignData {
  try {
    assertSchema<UpdateCampaignData>('update-campaign-data', data)
  } catch (error) {
    throw new ReplServerError(`UpdateCampaignData validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}

export function validateDeleteCampaignData(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is DeleteCampaignData {
  try {
    assertSchema<DeleteCampaignData>('delete-campaign-data', data)
  } catch (error) {
    throw new ReplServerError(`DeleteCampaignData validation failed`, {
      cause: error,
      code: 'BAD_PARAMS'
    })
  }
}
