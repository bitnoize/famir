import { JSONSchemaType, customIdentSchema } from '@famir/common'
import {
  campaignDescriptionSchema,
  campaignLandingRedirectorParamSchema,
  campaignLandingUpgradeParamSchema,
  campaignLandingUpgradePathSchema,
  campaignLockCodeSchema,
  campaignMessageExpireSchema,
  campaignMirrorDomainSchema,
  campaignNewSessionExpireSchema,
  campaignSessionCookieNameSchema,
  campaignSessionExpireSchema
} from '@famir/database'
import { ValidatorSchemas } from '@famir/domain'
import {
  CreateCampaignData,
  DeleteCampaignData,
  LockCampaignData,
  ReadCampaignData,
  UnlockCampaignData,
  UpdateCampaignData
} from './campaign.js'

const createCampaignDataSchema: JSONSchemaType<CreateCampaignData> = {
  type: 'object',
  required: [
    'campaignId',
    'mirrorDomain',
    'description',
    'landingUpgradePath',
    'landingUpgradeParam',
    'landingRedirectorParam',
    'sessionCookieName',
    'sessionExpire',
    'newSessionExpire',
    'messageExpire'
  ],
  properties: {
    campaignId: customIdentSchema,
    mirrorDomain: campaignMirrorDomainSchema,
    description: {
      ...campaignDescriptionSchema,
      default: ''
    },
    landingUpgradePath: {
      ...campaignLandingUpgradePathSchema,
      default: '/fake-auth'
    },
    landingUpgradeParam: {
      ...campaignLandingUpgradeParamSchema,
      default: 'data'
    },
    landingRedirectorParam: {
      ...campaignLandingRedirectorParamSchema,
      default: 'data'
    },
    sessionCookieName: {
      ...campaignSessionCookieNameSchema,
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

const readCampaignDataSchema: JSONSchemaType<ReadCampaignData> = {
  type: 'object',
  required: ['campaignId'],
  properties: {
    campaignId: customIdentSchema
  },
  additionalProperties: false
}

const lockCampaignDataSchema: JSONSchemaType<LockCampaignData> = {
  type: 'object',
  required: ['campaignId'],
  properties: {
    campaignId: customIdentSchema,
    isForce: {
      type: 'boolean',
      nullable: true
    }
  },
  additionalProperties: false
} as const

const unlockCampaignDataSchema: JSONSchemaType<UnlockCampaignData> = {
  type: 'object',
  required: ['campaignId', 'lockCode'],
  properties: {
    campaignId: customIdentSchema,
    lockCode: campaignLockCodeSchema
  },
  additionalProperties: false
} as const

const updateCampaignDataSchema: JSONSchemaType<UpdateCampaignData> = {
  type: 'object',
  required: ['campaignId', 'lockCode'],
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
    },
    lockCode: campaignLockCodeSchema
  },
  additionalProperties: false
} as const

const deleteCampaignDataSchema: JSONSchemaType<DeleteCampaignData> = {
  type: 'object',
  required: ['campaignId', 'lockCode'],
  properties: {
    campaignId: customIdentSchema,
    lockCode: campaignLockCodeSchema
  },
  additionalProperties: false
} as const

export const campaignSchemas: ValidatorSchemas = {
  'console-create-campaign-data': createCampaignDataSchema,
  'console-read-campaign-data': readCampaignDataSchema,
  'console-lock-campaign-data': lockCampaignDataSchema,
  'console-unlock-campaign-data': unlockCampaignDataSchema,
  'console-update-campaign-data': updateCampaignDataSchema,
  'console-delete-campaign-data': deleteCampaignDataSchema
} as const
