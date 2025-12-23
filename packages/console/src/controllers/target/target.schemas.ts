import { JSONSchemaType, booleanSchema, customIdentSchema } from '@famir/common'
import {
  targetConnectTimeoutSchema,
  targetContentSchema,
  targetDomainSchema,
  targetLabelSchema,
  targetOrdinaryTimeoutSchema,
  targetPortSchema,
  targetRequestBodyLimitSchema,
  targetResponseBodyLimitSchema,
  targetStreamingTimeoutSchema,
  targetSubSchema
} from '@famir/database'
import {
  ActionTargetLabelData,
  CreateTargetData,
  DeleteTargetData,
  ListTargetsData,
  ReadTargetData,
  SwitchTargetData,
  UpdateTargetData
} from './target.js'

export const createTargetDataSchema: JSONSchemaType<CreateTargetData> = {
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
    'ordinaryTimeout',
    'streamingTimeout',
    'requestBodyLimit',
    'responseBodyLimit',
    'mainPage',
    'notFoundPage',
    'faviconIco',
    'robotsTxt',
    'sitemapXml'
  ],
  properties: {
    campaignId: customIdentSchema,
    targetId: customIdentSchema,
    isLanding: booleanSchema,
    donorSecure: booleanSchema,
    donorSub: targetSubSchema,
    donorDomain: targetDomainSchema,
    donorPort: targetPortSchema,
    mirrorSecure: booleanSchema,
    mirrorSub: targetSubSchema,
    mirrorPort: targetPortSchema,
    connectTimeout: {
      ...targetConnectTimeoutSchema,
      default: 1 * 1000
    },
    ordinaryTimeout: {
      ...targetOrdinaryTimeoutSchema,
      default: 10 * 1000
    },
    streamingTimeout: {
      ...targetStreamingTimeoutSchema,
      default: 3600 * 1000
    },
    requestBodyLimit: {
      ...targetRequestBodyLimitSchema,
      default: 10 * 1024 * 1024
    },
    responseBodyLimit: {
      ...targetResponseBodyLimitSchema,
      default: 10 * 1024 * 1024
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
    }
  },
  additionalProperties: false
} as const

export const readTargetDataSchema: JSONSchemaType<ReadTargetData> = {
  type: 'object',
  required: ['campaignId', 'targetId'],
  properties: {
    campaignId: customIdentSchema,
    targetId: customIdentSchema
  },
  additionalProperties: false
} as const

export const updateTargetDataSchema: JSONSchemaType<UpdateTargetData> = {
  type: 'object',
  required: ['campaignId', 'targetId'],
  properties: {
    campaignId: customIdentSchema,
    targetId: customIdentSchema,
    connectTimeout: {
      ...targetConnectTimeoutSchema,
      nullable: true
    },
    ordinaryTimeout: {
      ...targetOrdinaryTimeoutSchema,
      nullable: true
    },
    streamingTimeout: {
      ...targetStreamingTimeoutSchema,
      nullable: true
    },
    requestBodyLimit: {
      ...targetRequestBodyLimitSchema,
      nullable: true
    },
    responseBodyLimit: {
      ...targetResponseBodyLimitSchema,
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
    }
  },
  additionalProperties: false
} as const

export const switchTargetDataSchema: JSONSchemaType<SwitchTargetData> = {
  type: 'object',
  required: ['campaignId', 'targetId'],
  properties: {
    campaignId: customIdentSchema,
    targetId: customIdentSchema
  },
  additionalProperties: false
} as const

export const actionTargetLabelDataSchema: JSONSchemaType<ActionTargetLabelData> = {
  type: 'object',
  required: ['campaignId', 'targetId', 'label'],
  properties: {
    campaignId: customIdentSchema,
    targetId: customIdentSchema,
    label: targetLabelSchema
  },
  additionalProperties: false
} as const

export const deleteTargetDataSchema: JSONSchemaType<DeleteTargetData> = {
  type: 'object',
  required: ['campaignId', 'targetId'],
  properties: {
    campaignId: customIdentSchema,
    targetId: customIdentSchema
  },
  additionalProperties: false
} as const

export const listTargetsDataSchema: JSONSchemaType<ListTargetsData> = {
  type: 'object',
  required: ['campaignId'],
  properties: {
    campaignId: customIdentSchema
  },
  additionalProperties: false
} as const
