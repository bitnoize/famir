import { JSONSchemaType } from '@famir/common'
import {
  CreateTargetModel,
  DeleteTargetModel,
  ListTargetModels,
  ReadTargetModel,
  SwitchTargetModel,
  UpdateTargetModel
} from '@famir/domain'
import { customIdentSchema, simpleBooleanSchema } from '@famir/validator'

export const targetSubSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128
} as const

export const targetDomainSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128
} as const

export const targetPortSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 0,
  maximum: 65535
} as const

export const targetConnectTimeoutSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 60 * 1000
} as const

export const targetTimeoutSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1 * 1000,
  maximum: 5 * 60 * 1000
} as const

export const targetContentSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 0,
  maxLength: 10485760
} as const

export const targetRedirectUrlSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 1,
  maxLength: 128
} as const

export const createTargetModelSchema: JSONSchemaType<CreateTargetModel> = {
  type: 'object',
  required: [
    'campaignId',
    'targetId',
    'isLanding',
    'donorSecure',
    'donorSub',
    'donorDomain',
    'donorPort',
    'mirrorSecure',
    'mirrorSub',
    'mirrorPort',
    'connectTimeout',
    'timeout',
    'mainPage',
    'notFoundPage',
    'faviconIco',
    'robotsTxt',
    'sitemapXml',
    'successRedirectUrl',
    'failureRedirectUrl'
  ],
  properties: {
    campaignId: customIdentSchema,
    targetId: customIdentSchema,
    isLanding: simpleBooleanSchema,
    donorSecure: simpleBooleanSchema,
    donorSub: targetSubSchema,
    donorDomain: targetDomainSchema,
    donorPort: targetPortSchema,
    mirrorSecure: simpleBooleanSchema,
    mirrorSub: targetSubSchema,
    mirrorPort: targetPortSchema,
    connectTimeout: {
      ...targetConnectTimeoutSchema,
      default: 1 * 1000
    },
    timeout: {
      ...targetTimeoutSchema,
      default: 10 * 1000
    },
    mainPage: {
      ...targetContentSchema,
      default: ''
    },
    notFoundPage: {
      ...targetContentSchema,
      default: ''
    },
    faviconIco: {
      ...targetContentSchema,
      default: ''
    },
    robotsTxt: {
      ...targetContentSchema,
      default: ''
    },
    sitemapXml: {
      ...targetContentSchema,
      default: ''
    },
    successRedirectUrl: {
      ...targetRedirectUrlSchema,
      default: '/'
    },
    failureRedirectUrl: {
      ...targetRedirectUrlSchema,
      default: '/'
    }
  },
  additionalProperties: false
} as const

export const readTargetModelSchema: JSONSchemaType<ReadTargetModel> = {
  type: 'object',
  required: ['campaignId', 'targetId'],
  properties: {
    campaignId: customIdentSchema,
    targetId: customIdentSchema
  },
  additionalProperties: false
} as const

export const updateTargetModelSchema: JSONSchemaType<UpdateTargetModel> = {
  type: 'object',
  required: ['campaignId', 'targetId'],
  properties: {
    campaignId: customIdentSchema,
    targetId: customIdentSchema,
    connectTimeout: {
      ...targetConnectTimeoutSchema,
      nullable: true
    },
    timeout: {
      ...targetTimeoutSchema,
      nullable: true
    },
    mainPage: {
      ...targetContentSchema,
      nullable: true
    },
    notFoundPage: {
      ...targetContentSchema,
      nullable: true
    },
    faviconIco: {
      ...targetContentSchema,
      nullable: true
    },
    robotsTxt: {
      ...targetContentSchema,
      nullable: true
    },
    sitemapXml: {
      ...targetContentSchema,
      nullable: true
    },
    successRedirectUrl: {
      ...targetRedirectUrlSchema,
      nullable: true
    },
    failureRedirectUrl: {
      ...targetRedirectUrlSchema,
      nullable: true
    }
  },
  additionalProperties: false
} as const

export const switchTargetModelSchema: JSONSchemaType<SwitchTargetModel> = {
  type: 'object',
  required: ['campaignId', 'targetId'],
  properties: {
    campaignId: customIdentSchema,
    targetId: customIdentSchema
  },
  additionalProperties: false
} as const

export const deleteTargetModelSchema: JSONSchemaType<DeleteTargetModel> = {
  type: 'object',
  required: ['campaignId', 'targetId'],
  properties: {
    campaignId: customIdentSchema,
    targetId: customIdentSchema
  },
  additionalProperties: false
} as const

export const listTargetModelsSchema: JSONSchemaType<ListTargetModels> = {
  type: 'object',
  required: ['campaignId'],
  properties: {
    campaignId: customIdentSchema
  },
  additionalProperties: false
} as const
