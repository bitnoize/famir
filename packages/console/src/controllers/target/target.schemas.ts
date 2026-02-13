import {
  targetConnectTimeoutSchema,
  targetContentSchema,
  targetDomainSchema,
  targetLabelSchema,
  targetPortSchema,
  targetRequestBodyLimitSchema,
  targetResponseBodyLimitSchema,
  targetSimpleTimeoutSchema,
  targetStreamTimeoutSchema,
  targetSubSchema
} from '@famir/database'
import {
  JSONSchemaType,
  ValidatorSchemas,
  booleanSchema,
  customIdentSchema,
  randomIdentSchema
} from '@famir/validator'
import {
  ActionTargetLabelData,
  CreateTargetData,
  DeleteTargetData,
  ListTargetsData,
  ReadTargetData,
  SwitchTargetData,
  UpdateTargetData
} from './target.js'

const createTargetDataSchema: JSONSchemaType<CreateTargetData> = {
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
    'simpleTimeout',
    'streamTimeout',
    'requestBodyLimit',
    'responseBodyLimit',
    'mainPage',
    'notFoundPage',
    'faviconIco',
    'robotsTxt',
    'sitemapXml',
    'lockSecret'
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
    simpleTimeout: {
      ...targetSimpleTimeoutSchema,
      default: 10 * 1000
    },
    streamTimeout: {
      ...targetStreamTimeoutSchema,
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
    },
    lockSecret: randomIdentSchema
  },
  additionalProperties: false
} as const

const readTargetDataSchema: JSONSchemaType<ReadTargetData> = {
  type: 'object',
  required: ['campaignId', 'targetId'],
  properties: {
    campaignId: customIdentSchema,
    targetId: customIdentSchema
  },
  additionalProperties: false
} as const

const updateTargetDataSchema: JSONSchemaType<UpdateTargetData> = {
  type: 'object',
  required: ['campaignId', 'targetId', 'lockSecret'],
  properties: {
    campaignId: customIdentSchema,
    targetId: customIdentSchema,
    connectTimeout: {
      ...targetConnectTimeoutSchema,
      nullable: true
    },
    simpleTimeout: {
      ...targetSimpleTimeoutSchema,
      nullable: true
    },
    streamTimeout: {
      ...targetStreamTimeoutSchema,
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
    },
    lockSecret: randomIdentSchema
  },
  additionalProperties: false
} as const

const switchTargetDataSchema: JSONSchemaType<SwitchTargetData> = {
  type: 'object',
  required: ['campaignId', 'targetId', 'lockSecret'],
  properties: {
    campaignId: customIdentSchema,
    targetId: customIdentSchema,
    lockSecret: randomIdentSchema
  },
  additionalProperties: false
} as const

const actionTargetLabelDataSchema: JSONSchemaType<ActionTargetLabelData> = {
  type: 'object',
  required: ['campaignId', 'targetId', 'label', 'lockSecret'],
  properties: {
    campaignId: customIdentSchema,
    targetId: customIdentSchema,
    label: targetLabelSchema,
    lockSecret: randomIdentSchema
  },
  additionalProperties: false
} as const

const deleteTargetDataSchema: JSONSchemaType<DeleteTargetData> = {
  type: 'object',
  required: ['campaignId', 'targetId', 'lockSecret'],
  properties: {
    campaignId: customIdentSchema,
    targetId: customIdentSchema,
    lockSecret: randomIdentSchema
  },
  additionalProperties: false
} as const

const listTargetsDataSchema: JSONSchemaType<ListTargetsData> = {
  type: 'object',
  required: ['campaignId'],
  properties: {
    campaignId: customIdentSchema
  },
  additionalProperties: false
} as const

export const targetSchemas: ValidatorSchemas = {
  'console-create-target-data': createTargetDataSchema,
  'console-read-target-data': readTargetDataSchema,
  'console-update-target-data': updateTargetDataSchema,
  'console-switch-target-data': switchTargetDataSchema,
  'console-action-target-label-data': actionTargetLabelDataSchema,
  'console-delete-target-data': deleteTargetDataSchema,
  'console-list-targets-data': listTargetsDataSchema
} as const
