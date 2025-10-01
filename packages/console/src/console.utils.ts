import {
  createCampaignDataSchema,
  deleteCampaignDataSchema,
  readCampaignDataSchema,
  updateCampaignDataSchema
} from '@famir/database'
import { ValidatorSchemas } from '@famir/domain'

export const internalSchemas: ValidatorSchemas = {
  'create-campaign-data': createCampaignDataSchema,
  'read-campaign-data': readCampaignDataSchema,
  'update-campaign-data': updateCampaignDataSchema,
  'delete-campaign-data': deleteCampaignDataSchema
}
