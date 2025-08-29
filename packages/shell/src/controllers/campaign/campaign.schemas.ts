import {
  campaignDescriptionSchema,
  campaignMessageEmergeIdleTimeSchema,
  campaignMessageEmergeLimitSchema,
  campaignMessageExpireSchema,
  campaignMessageLimitSchema,
  campaignMessageLockExpireSchema,
  campaignNewSessionExpireSchema,
  campaignSessionEmergeIdleTimeSchema,
  campaignSessionEmergeLimitSchema,
  campaignSessionExpireSchema,
  campaignSessionLimitSchema
} from '@famir/database'
import { JSONSchemaType, customIdentSchema, randomIdentSchema } from '@famir/validator'
import { CreateCampaignDto, UpdateCampaignDto } from '../../use-cases/index.js'

export const createCampaignDtoSchema: JSONSchemaType<CreateCampaignDto> = {
  type: 'object',
  required: [],
  properties: {
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
    sessionLimit: {
      ...campaignSessionLimitSchema,
      nullable: true
    },
    sessionEmergeIdleTime: {
      ...campaignSessionEmergeIdleTimeSchema,
      nullable: true
    },
    sessionEmergeLimit: {
      ...campaignSessionEmergeLimitSchema,
      nullable: true
    },
    messageExpire: {
      ...campaignMessageExpireSchema,
      nullable: true
    },
    messageLimit: {
      ...campaignMessageLimitSchema,
      nullable: true
    },
    messageEmergeIdleTime: {
      ...campaignMessageEmergeIdleTimeSchema,
      nullable: true
    },
    messageEmergeLimit: {
      ...campaignMessageEmergeLimitSchema,
      nullable: true
    },
    messageLockExpire: {
      ...campaignMessageLockExpireSchema,
      nullable: true
    }
  },
  additionalProperties: false
} as const

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
    sessionLimit: {
      ...campaignSessionLimitSchema,
      nullable: true
    },
    sessionEmergeIdleTime: {
      ...campaignSessionEmergeIdleTimeSchema,
      nullable: true
    },
    sessionEmergeLimit: {
      ...campaignSessionEmergeLimitSchema,
      nullable: true
    },
    messageExpire: {
      ...campaignMessageExpireSchema,
      nullable: true
    },
    messageLimit: {
      ...campaignMessageLimitSchema,
      nullable: true
    },
    messageEmergeIdleTime: {
      ...campaignMessageEmergeIdleTimeSchema,
      nullable: true
    },
    messageEmergeLimit: {
      ...campaignMessageEmergeLimitSchema,
      nullable: true
    },
    messageLockExpire: {
      ...campaignMessageLockExpireSchema,
      nullable: true
    }
  },
  additionalProperties: false
} as const
