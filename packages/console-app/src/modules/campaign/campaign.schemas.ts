import {
  campaignDescriptionSchema,
  campaignMessageExpireSchema,
  campaignMirrorDomainSchema,
  campaignNewSessionExpireSchema,
  campaignSessionCookieNameSchema,
  campaignSessionExpireSchema,
  campaignUpgradeSessionPathSchema,
} from '@famir/database'
import {
  JSONSchemaType,
  ValidatorSchemas,
  customIdentSchema,
  randomIdentSchema,
} from '@famir/validator'
import {
  CreateCampaignData,
  DeleteCampaignData,
  LockCampaignData,
  ReadCampaignData,
  UnlockCampaignData,
  UpdateCampaignData,
} from './campaign.js'

/**
 * @category Campaign
 * @internal
 */
const createCampaignDataSchema: JSONSchemaType<CreateCampaignData> = {
  type: 'object',
  required: [
    'campaignId',
    'mirrorDomain',
    'description',
    'upgradeSessionPath',
    'sessionCookieName',
    'sessionExpire',
    'newSessionExpire',
    'messageExpire',
  ],
  properties: {
    campaignId: customIdentSchema,
    mirrorDomain: campaignMirrorDomainSchema,
    description: {
      ...campaignDescriptionSchema,
      default: '',
    },
    cryptSecret: {
      ...randomIdentSchema,
      nullable: true,
    },
    upgradeSessionPath: {
      ...campaignUpgradeSessionPathSchema,
      default: '/fake-upgrade-session',
    },
    sessionCookieName: {
      ...campaignSessionCookieNameSchema,
      default: 'fake-sess', // FIXME
    },
    sessionExpire: {
      ...campaignSessionExpireSchema,
      default: 24 * 3600 * 1000,
    },
    newSessionExpire: {
      ...campaignNewSessionExpireSchema,
      default: 300 * 1000,
    },
    messageExpire: {
      ...campaignMessageExpireSchema,
      default: 3600 * 1000,
    },
  },
  additionalProperties: false,
} as const

/**
 * @category Campaign
 * @internal
 */
const readCampaignDataSchema: JSONSchemaType<ReadCampaignData> = {
  type: 'object',
  required: ['campaignId'],
  properties: {
    campaignId: customIdentSchema,
  },
  additionalProperties: false,
}

/**
 * @category Campaign
 * @internal
 */
const lockCampaignDataSchema: JSONSchemaType<LockCampaignData> = {
  type: 'object',
  required: ['campaignId'],
  properties: {
    campaignId: customIdentSchema,
  },
  additionalProperties: false,
} as const

/**
 * @category Campaign
 * @internal
 */
const unlockCampaignDataSchema: JSONSchemaType<UnlockCampaignData> = {
  type: 'object',
  required: ['campaignId', 'lockSecret'],
  properties: {
    campaignId: customIdentSchema,
    lockSecret: randomIdentSchema,
  },
  additionalProperties: false,
} as const

/**
 * @category Campaign
 * @internal
 */
const updateCampaignDataSchema: JSONSchemaType<UpdateCampaignData> = {
  type: 'object',
  required: ['campaignId', 'lockSecret'],
  properties: {
    campaignId: customIdentSchema,
    description: {
      ...campaignDescriptionSchema,
      nullable: true,
    },
    sessionExpire: {
      ...campaignSessionExpireSchema,
      nullable: true,
    },
    newSessionExpire: {
      ...campaignNewSessionExpireSchema,
      nullable: true,
    },
    messageExpire: {
      ...campaignMessageExpireSchema,
      nullable: true,
    },
    lockSecret: randomIdentSchema,
  },
  additionalProperties: false,
} as const

/**
 * @category Campaign
 * @internal
 */
const deleteCampaignDataSchema: JSONSchemaType<DeleteCampaignData> = {
  type: 'object',
  required: ['campaignId', 'lockSecret'],
  properties: {
    campaignId: customIdentSchema,
    lockSecret: randomIdentSchema,
  },
  additionalProperties: false,
} as const

/**
 * @category Campaign
 * @internal
 */
export const campaignSchemas: ValidatorSchemas = {
  'console-create-campaign-data': createCampaignDataSchema,
  'console-read-campaign-data': readCampaignDataSchema,
  'console-lock-campaign-data': lockCampaignDataSchema,
  'console-unlock-campaign-data': unlockCampaignDataSchema,
  'console-update-campaign-data': updateCampaignDataSchema,
  'console-delete-campaign-data': deleteCampaignDataSchema,
} as const
