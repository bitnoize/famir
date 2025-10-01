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
  required: ['id'],
  properties: {
    id: customIdentSchema,
    description: {
      ...campaignDescriptionSchema,
      nullable: true
    },
    landingSecret: {
      ...randomIdentSchema,
      nullable: true
    },
    landingAuthPath: {
      ...customIdentSchema,
      nullable: true
    },
    landingAuthParam: {
      ...customIdentSchema,
      nullable: true
    },
    landingLureParam: {
      ...customIdentSchema,
      nullable: true
    },
    sessionCookieName: {
      ...customIdentSchema,
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

export const readCampaignDataSchema: JSONSchemaType<ReadCampaignData> = {
  type: 'object',
  required: ['id'],
  properties: {
    id: customIdentSchema
  }
}

export const updateCampaignDataSchema: JSONSchemaType<UpdateCampaignData> = {
  type: 'object',
  required: ['id'],
  properties: {
    id: customIdentSchema,
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
  required: ['id'],
  properties: {
    id: customIdentSchema
  }
}
