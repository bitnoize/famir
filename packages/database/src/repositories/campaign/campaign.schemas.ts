import { JSONSchemaType } from '@famir/common'
import { ValidatorSchemas } from '@famir/domain'
import { RawCampaign, RawFullCampaign } from './campaign.functions.js'

const rawCampaignSchema: JSONSchemaType<RawCampaign> = {
  type: 'object',
  required: [
    'campaign_id',
    'mirror_domain',
    'session_count',
    'message_count',
    'created_at',
    'updated_at'
  ],
  properties: {
    campaign_id: {
      type: 'string'
    },
    mirror_domain: {
      type: 'string'
    },
    session_count: {
      type: 'integer'
    },
    message_count: {
      type: 'integer'
    },
    created_at: {
      type: 'integer'
    },
    updated_at: {
      type: 'integer'
    }
  },
  additionalProperties: false
} as const

const rawFullCampaignSchema: JSONSchemaType<RawFullCampaign> = {
  type: 'object',
  required: [
    'campaign_id',
    'mirror_domain',
    'description',
    'lock_timeout',
    'landing_upgrade_path',
    'landing_upgrade_param',
    'landing_redirector_param',
    'session_cookie_name',
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
    'updated_at'
  ],
  properties: {
    campaign_id: {
      type: 'string'
    },
    mirror_domain: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    lock_timeout: {
      type: 'integer'
    },
    landing_upgrade_path: {
      type: 'string'
    },
    landing_upgrade_param: {
      type: 'string'
    },
    landing_redirector_param: {
      type: 'string'
    },
    session_cookie_name: {
      type: 'string'
    },
    session_expire: {
      type: 'integer'
    },
    new_session_expire: {
      type: 'integer'
    },
    message_expire: {
      type: 'integer'
    },
    is_locked: {
      type: 'integer'
    },
    proxy_count: {
      type: 'integer'
    },
    target_count: {
      type: 'integer'
    },
    redirector_count: {
      type: 'integer'
    },
    lure_count: {
      type: 'integer'
    },
    session_count: {
      type: 'integer'
    },
    message_count: {
      type: 'integer'
    },
    created_at: {
      type: 'integer'
    },
    updated_at: {
      type: 'integer'
    }
  },
  additionalProperties: false
} as const

export const campaignSchemas: ValidatorSchemas = {
  'database-raw-campaign': rawCampaignSchema,
  'database-raw-full-campaign': rawFullCampaignSchema
} as const

export const campaignMirrorDomainSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 256
} as const

export const campaignDescriptionSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 0,
  maxLength: 1024
} as const

export const campaignLockTimeoutSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 60 * 1000,
  maximum: 3600 * 1000
} as const

export const campaignLandingUpgradePathSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 3,
  maxLength: 64
} as const

export const campaignLandingUpgradeParamSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 8
} as const

export const campaignLandingRedirectorParamSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 8
} as const

export const campaignSessionCookieNameSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 3,
  maxLength: 64
} as const

export const campaignSessionExpireSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 3600 * 1000,
  maximum: 365 * 24 * 3600 * 1000
} as const

export const campaignNewSessionExpireSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1000,
  maximum: 900 * 1000
} as const

export const campaignMessageExpireSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 60 * 1000,
  maximum: 24 * 3600 * 1000
} as const
