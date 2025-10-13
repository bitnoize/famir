import {
  createCampaignModelSchema,
  deleteCampaignModelSchema,
  readCampaignModelSchema,
  updateCampaignModelSchema
} from '@famir/database'
import {
  CreateCampaignModel,
  DeleteCampaignModel,
  ReadCampaignModel,
  ReplServerError,
  UpdateCampaignModel,
  ValidatorAssertSchema,
  ValidatorSchemas
} from '@famir/domain'

export const addSchemas: ValidatorSchemas = {
  'create-campaign-model': createCampaignModelSchema,
  'read-campaign-model': readCampaignModelSchema,
  'update-campaign-model': updateCampaignModelSchema,
  'delete-campaign-model': deleteCampaignModelSchema
}
export function validateCreateCampaignModel(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is CreateCampaignModel {
  try {
    assertSchema<CreateCampaignModel>('create-campaign-model', data)
  } catch (error) {
    throw new ReplServerError(`CreateCampaignModel validation failed`, {
      cause: error,
      code: 'BAD_REQUEST'
    })
  }
}

export function validateReadCampaignModel(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is ReadCampaignModel {
  try {
    assertSchema<ReadCampaignModel>('read-campaign-model', data)
  } catch (error) {
    throw new ReplServerError(`ReadCampaignModel validation failed`, {
      cause: error,
      code: 'BAD_REQUEST'
    })
  }
}

export function validateUpdateCampaignModel(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is UpdateCampaignModel {
  try {
    assertSchema<UpdateCampaignModel>('update-campaign-model', data)
  } catch (error) {
    throw new ReplServerError(`UpdateCampaignModel validation failed`, {
      cause: error,
      code: 'BAD_REQUEST'
    })
  }
}

export function validateDeleteCampaignModel(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is DeleteCampaignModel {
  try {
    assertSchema<DeleteCampaignModel>('delete-campaign-model', data)
  } catch (error) {
    throw new ReplServerError(`DeleteCampaignModel validation failed`, {
      cause: error,
      code: 'BAD_REQUEST'
    })
  }
}
