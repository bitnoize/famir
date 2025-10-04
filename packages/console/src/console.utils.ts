import {
  createCampaignDataSchema,
  createProxyDataSchema,
  createTargetDataSchema,
  deleteCampaignDataSchema,
  deleteProxyDataSchema,
  deleteTargetDataSchema,
  listProxiesDataSchema,
  listTargetsDataSchema,
  readCampaignDataSchema,
  readProxyDataSchema,
  readTargetDataSchema,
  switchProxyDataSchema,
  switchTargetDataSchema,
  updateCampaignDataSchema
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
  'list-proxies-data': listProxiesDataSchema,
  'create-target-data': createTargetDataSchema,
  'read-target-data': readTargetDataSchema,
  'switch-target-data': switchTargetDataSchema,
  'delete-target-data': deleteTargetDataSchema,
  'list-targets-data': listTargetsDataSchema
}
