import {
  createCampaignDataSchema,
  deleteCampaignDataSchema,
  readCampaignDataSchema,
  updateCampaignDataSchema,
  createProxyDataSchema,
  deleteProxyDataSchema,
  readProxyDataSchema,
  switchProxyDataSchema,
  listProxiesDataSchema
} from '@famir/database'
import { ValidatorSchemas } from '@famir/domain'

export const internalSchemas: ValidatorSchemas = {
  'create-campaign-data': createCampaignDataSchema,
  'read-campaign-data': readCampaignDataSchema,
  'update-campaign-data': updateCampaignDataSchema,
  'delete-campaign-data': deleteCampaignDataSchema,
  'create-proxy-data': createProxyDataSchema,
  'read-proxy-data': readProxyDataSchema,
  'switch-proxy-data': switchProxyDataSchema,
  'delete-proxy-data': deleteProxyDataSchema,
  'list-proxies-data': listProxiesDataSchema
}
