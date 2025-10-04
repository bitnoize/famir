import { JSONSchemaType } from '@famir/common'
import {
  CreateCampaignData,
  DeleteCampaignData,
  ReadCampaignData,
  UpdateCampaignData
} from '@famir/domain'
import { customIdentSchema, randomIdentSchema } from '@famir/validator'

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
  required: ['campaignId'],
  properties: {
    campaignId: customIdentSchema,
    description: {
      ...campaignDescriptionSchema,
      default: ''
    },
    landingSecret: {
      ...randomIdentSchema,
      nullable: true
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
}
