import { JSONSchemaType } from '@famir/common'
import {
  campaignDescriptionSchema,
  campaignMessageExpireSchema,
  campaignNewSessionExpireSchema,
  campaignSessionExpireSchema
} from '@famir/database'
import { customIdentSchema, randomIdentSchema } from '@famir/validator'
import {
  CreateCampaignData,
  DeleteCampaignData,
  ReadCampaignData,
  UpdateCampaignData
} from '../../use-cases/index.js'

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
