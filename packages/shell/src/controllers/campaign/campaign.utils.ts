import { ValidatorAssertSchema } from '@famir/validator'
import { validateDto } from '../../shell.utils.js'
import { CreateCampaignDto, UpdateCampaignDto } from '../../use-cases/index.js'

export function validateCreateCampaignDto(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is CreateCampaignDto {
  validateDto<CreateCampaignDto>(assertSchema, 'create-campaign-dto', data, 'createCampaignDto')
}

export function validateUpdateCampaignDto(
  assertSchema: ValidatorAssertSchema,
  data: unknown
): asserts data is UpdateCampaignDto {
  validateDto<UpdateCampaignDto>(assertSchema, 'update-campaign-dto', data, 'updateCampaignDto')
}
