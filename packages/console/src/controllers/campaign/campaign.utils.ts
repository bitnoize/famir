import {
  CreateCampaignData,
  DeleteCampaignData,
  ReadCampaignData,
  ReplServerError,
  UpdateCampaignData,
  ValidatorAssertSchema
} from '@famir/domain'

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
