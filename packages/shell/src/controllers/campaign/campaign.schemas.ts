import { JSONSchemaType } from '@famir/common'
import {
  campaignDescriptionSchema,
  campaignMessageExpireSchema,
  campaignNewSessionExpireSchema,
  campaignSessionExpireSchema
} from '@famir/database'
import { customIdentSchema, randomIdentSchema } from '@famir/validator'
import { CreateCampaignDto } from '../../use-cases/index.js'

export const createCampaignDtoSchema: JSONSchemaType<CreateCampaignDto> = {
  type: 'object',
  required: [],
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

/*
export const updateCampaignDtoSchema: JSONSchemaType<UpdateCampaignDto> = {
  type: 'object',
  required: [],
  properties: {
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
    },
  },
  additionalProperties: false
} as const
  */
