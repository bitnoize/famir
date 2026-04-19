import { JSONSchemaType, ValidatorSchemas } from '@famir/validator'
import { RawCampaign, RawFullCampaign } from './campaign.functions.js'

/**
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
    campaign_id: {
      type: 'string',
    },
    mirror_domain: {
      type: 'string',
    },
    is_locked: {
      type: 'integer',
    },
    session_count: {
      type: 'integer',
    },
    message_count: {
      type: 'integer',
    },
    created_at: {
      type: 'integer',
    },
  },
  additionalProperties: false,
} as const

/**
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
    campaign_id: {
      type: 'string',
    },
    mirror_domain: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
    crypt_secret: {
      type: 'string',
    },
    upgrade_session_path: {
      type: 'string',
    },
    session_cookie_name: {
      type: 'string',
    },
    session_cookie_names: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    session_expire: {
      type: 'integer',
    },
    new_session_expire: {
      type: 'integer',
    },
    message_expire: {
      type: 'integer',
    },
    is_locked: {
      type: 'integer',
    },
    proxy_count: {
      type: 'integer',
    },
    target_count: {
      type: 'integer',
    },
    redirector_count: {
      type: 'integer',
    },
    lure_count: {
      type: 'integer',
    },
    session_count: {
      type: 'integer',
    },
    message_count: {
      type: 'integer',
    },
    created_at: {
      type: 'integer',
    },
  },
  additionalProperties: false,
} as const

/**
 * @category Campaign
 * @internal
 */
export const campaignMirrorDomainSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256,
} as const

/**
 * @category Campaign
 * @internal
 */
export const campaignDescriptionSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 0,
  maxLength: 1024,
} as const

/**
 * @category Campaign
 * @internal
 */
export const campaignUpgradeSessionPathSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 3,
  maxLength: 64,
} as const

/**
 * @category Campaign
 * @internal
 */
export const campaignSessionCookieNameSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 3,
  maxLength: 64,
} as const

/**
 * @category Campaign
 * @internal
 */
export const campaignSessionExpireSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 3600 * 1000,
  maximum: 365 * 24 * 3600 * 1000,
} as const

/**
 * @category Campaign
 * @internal
 */
export const campaignNewSessionExpireSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1000,
  maximum: 900 * 1000,
} as const

/**
 * @category Campaign
 * @internal
 */
export const campaignMessageExpireSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 60 * 1000,
  maximum: 24 * 3600 * 1000,
} as const

/**
 * @category Campaign
 * @internal
 */
export const campaignSchemas: ValidatorSchemas = {
  'database-raw-campaign': rawCampaignSchema,
  'database-raw-full-campaign': rawFullCampaignSchema,
} as const
