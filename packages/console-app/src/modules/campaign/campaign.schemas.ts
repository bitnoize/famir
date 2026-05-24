import {
  campaignDescriptionSchema,
  campaignMessageExpireSchema,
  campaignMirrorDomainSchema,
  campaignNewSessionExpireSchema,
  campaignSessionCookieNameSchema,
  campaignSessionExpireSchema,
  campaignUpgradeSessionPathSchema,
} from '@famir/database'
import { JSONSchemaType, customIdentSchema, randomIdentSchema } from '@famir/validator'
import {
  CreateCampaignArgs,
  DeleteCampaignArgs,
  ListCampaignsArgs,
  LockCampaignArgs,
  ReadCampaignArgs,
  UnlockCampaignArgs,
  UpdateCampaignArgs,
} from './campaign.js'

/**
 * JSON Schema for validating a create campaign args.
 *
 * @category Campaign
 * @internal
 */
export const createCampaignArgsSchema: JSONSchemaType<CreateCampaignArgs> = {
  type: 'object',
  required: [
    '_',
    'mirrorDomain',
    'description',
    'upgradeSessionPath',
    'sessionExpire',
    'newSessionExpire',
    'messageExpire',
  ],
  properties: {
    _: {
      type: 'array',
      items: [customIdentSchema],
      minItems: 1,
      maxItems: 1,
    },
    mirrorDomain: campaignMirrorDomainSchema,
    description: campaignDescriptionSchema,
    cryptSecret: {
      ...randomIdentSchema,
      nullable: true,
    },
    upgradeSessionPath: campaignUpgradeSessionPathSchema,
    sessionCookieName: {
      ...campaignSessionCookieNameSchema,
      nullable: true,
    },
    sessionExpire: campaignSessionExpireSchema,
    newSessionExpire: campaignNewSessionExpireSchema,
    messageExpire: campaignMessageExpireSchema,
  },
  additionalProperties: false,
} as const

/**
 * JSON Schema for validating a read campaign args.
 *
 * @category Campaign
 * @internal
 */
export const readCampaignArgsSchema: JSONSchemaType<ReadCampaignArgs> = {
  type: 'object',
  required: ['_'],
  properties: {
    _: {
      type: 'array',
      items: [customIdentSchema],
      minItems: 1,
      maxItems: 1,
    },
  },
  additionalProperties: false,
} as const /**

/**
 * JSON Schema for validating a lock campaign args.
 *
 * @category Campaign
 * @internal
 */
export const lockCampaignArgsSchema: JSONSchemaType<LockCampaignArgs> = {
  type: 'object',
  required: ['_'],
  properties: {
    _: {
      type: 'array',
      items: [customIdentSchema],
      minItems: 1,
      maxItems: 1,
    },
  },
  additionalProperties: false,
} as const

/**
 * JSON Schema for validating an unlock campaign args.
 *
 * @category Campaign
 * @internal
 */
export const unlockCampaignArgsSchema: JSONSchemaType<UnlockCampaignArgs> = {
  type: 'object',
  required: ['_', 'lockSecret'],
  properties: {
    _: {
      type: 'array',
      items: [customIdentSchema],
      minItems: 1,
      maxItems: 1,
    },
    lockSecret: randomIdentSchema,
  },
  additionalProperties: false,
} as const

/**
 * JSON Schema for validating an update campaign args.
 *
 * @category Campaign
 * @internal
 */
export const updateCampaignArgsSchema: JSONSchemaType<UpdateCampaignArgs> = {
  type: 'object',
  required: ['_', 'lockSecret'],
  properties: {
    _: {
      type: 'array',
      items: [customIdentSchema],
      minItems: 1,
      maxItems: 1,
    },
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
 * JSON Schema for validating a delete campaign args.
 *
 * @category Campaign
 * @internal
 */
export const deleteCampaignArgsSchema: JSONSchemaType<DeleteCampaignArgs> = {
  type: 'object',
  required: ['_', 'lockSecret'],
  properties: {
    _: {
      type: 'array',
      items: [customIdentSchema],
      minItems: 1,
      maxItems: 1,
    },
    lockSecret: randomIdentSchema,
  },
  additionalProperties: false,
} as const

/**
 * JSON Schema for validating a list campaigns args.
 *
 * @category Campaign
 * @internal
 */
export const listCampaignsArgsSchema: JSONSchemaType<ListCampaignsArgs> = {
  type: 'object',
  required: ['_'],
  properties: {
    _: {
      type: 'array',
      items: {
        type: 'string',
      },
      minItems: 0,
      maxItems: 0,
    },
  },
  additionalProperties: false,
} as const
