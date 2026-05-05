import {
  JSONSchemaType,
  ValidatorSchemas,
  booleanSchema,
  counterSchema,
  customIdentSchema,
  randomIdentSchema,
  timestampSchema,
} from '@famir/validator'
import { RawCampaign, RawFullCampaign } from './campaign.functions.js'

/**
 * Schema for a campaign mirror domain.
 *
 * @category Campaign
 * @internal
 */
export const campaignMirrorDomainSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256,
} as const

/**
 * Schema for a campaign description.
 *
 * @category Campaign
 * @internal
 */
export const campaignDescriptionSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 0,
  maxLength: 1024,
} as const

/**
 * Schema for a campaign upgrade session path.
 *
 * @category Campaign
 * @internal
 */
export const campaignUpgradeSessionPathSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 3,
  maxLength: 64,
} as const

/**
 * Schema for a campaign session cookie name.
 *
 * @category Campaign
 * @internal
 */
export const campaignSessionCookieNameSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 3,
  maxLength: 64,
} as const

/**
 * Schema for a campaign session cookie names.
 *
 * @category Campaign
 * @internal
 */
export const campaignSessionCookieNamesSchema: JSONSchemaType<string[]> = {
  type: 'array',
  items: campaignSessionCookieNameSchema,
} as const

/**
 * Schema for a campaign session expire.
 *
 * @category Campaign
 * @internal
 */
export const campaignSessionExpireSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 3600 * 1000,
  maximum: 365 * 24 * 3600 * 1000,
} as const

/**
 * Schema for a campaign new session expire.
 *
 * @category Campaign
 * @internal
 */
export const campaignNewSessionExpireSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1000,
  maximum: 900 * 1000,
} as const

/**
 * Schema for a campaign message expire.
 *
 * @category Campaign
 * @internal
 */
export const campaignMessageExpireSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 60 * 1000,
  maximum: 24 * 3600 * 1000,
} as const

/**
 * Schema for validating raw campaign data from Redis.
 *
 * @category Campaign
 * @internal
 */
const rawCampaignSchema: JSONSchemaType<RawCampaign> = {
  type: 'object',
  required: [
    'campaign_id',
    'mirror_domain',
    'is_locked',
    'session_count',
    'message_count',
    'created_at',
  ],
  properties: {
    campaign_id: customIdentSchema,
    mirror_domain: campaignMirrorDomainSchema,
    is_locked: booleanSchema,
    session_count: counterSchema,
    message_count: counterSchema,
    created_at: timestampSchema,
  },
  additionalProperties: false,
} as const

/**
 * Schema for validating raw full campaign data from Redis.
 *
 * @category Campaign
 * @internal
 */
const rawFullCampaignSchema: JSONSchemaType<RawFullCampaign> = {
  type: 'object',
  required: [
    'campaign_id',
    'mirror_domain',
    'description',
    'crypt_secret',
    'upgrade_session_path',
    'session_cookie_name',
    'session_cookie_names',
    'session_expire',
    'new_session_expire',
    'message_expire',
    'is_locked',
    'proxy_count',
    'target_count',
    'redirector_count',
    'lure_count',
    'session_count',
    'message_count',
    'created_at',
  ],
  properties: {
    campaign_id: customIdentSchema,
    mirror_domain: campaignMirrorDomainSchema,
    description: campaignDescriptionSchema,
    crypt_secret: randomIdentSchema,
    upgrade_session_path: campaignUpgradeSessionPathSchema,
    session_cookie_name: campaignSessionCookieNameSchema,
    session_cookie_names: campaignSessionCookieNamesSchema,
    session_expire: campaignSessionExpireSchema,
    new_session_expire: campaignNewSessionExpireSchema,
    message_expire: campaignMessageExpireSchema,
    is_locked: booleanSchema,
    proxy_count: counterSchema,
    target_count: counterSchema,
    redirector_count: counterSchema,
    lure_count: counterSchema,
    session_count: counterSchema,
    message_count: counterSchema,
    created_at: timestampSchema,
  },
  additionalProperties: false,
} as const

/**
 * Collection of all schemas used by the campaign module.
 *
 * @category Campaign
 * @internal
 */
export const campaignSchemas: ValidatorSchemas = {
  'database-raw-campaign': rawCampaignSchema,
  'database-raw-full-campaign': rawFullCampaignSchema,
} as const
