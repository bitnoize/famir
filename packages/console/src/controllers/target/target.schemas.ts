import {
  targetAccessLevelSchema,
  targetBodySizeLimitSchema,
  targetConnectTimeoutSchema,
  targetContentSchema,
  targetDomainSchema,
  targetHeadersSizeLimitSchema,
  targetLabelSchema,
  targetPortSchema,
  targetSimpleTimeoutSchema,
  targetStreamTimeoutSchema,
  targetSubSchema,
} from '@famir/database'
import {
  JSONSchemaType,
  ValidatorSchemas,
  booleanSchema,
  customIdentSchema,
  randomIdentSchema,
} from '@famir/validator'
import {
  ActionTargetLabelData,
  CreateTargetData,
  DeleteTargetData,
  ListTargetsData,
  ReadTargetData,
  SwitchTargetData,
  UpdateTargetData,
} from '../../services/index.js'

const createTargetDataSchema: JSONSchemaType<CreateTargetData> = {
  type: 'object',
  required: [
    'campaignId',
    'targetId',
    'accessLevel',
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
    'headersSizeLimit',
    'bodySizeLimit',
    'mainPage',
    'notFoundPage',
    'faviconIco',
    'robotsTxt',
    'sitemapXml',
    'allowWebSockets',
    'lockSecret',
  ],
  properties: {
    campaignId: customIdentSchema,
    targetId: customIdentSchema,
    accessLevel: targetAccessLevelSchema,
    donorSecure: booleanSchema,
    donorSub: targetSubSchema,
    donorDomain: targetDomainSchema,
    donorPort: targetPortSchema,
    mirrorSecure: booleanSchema,
    mirrorSub: targetSubSchema,
    mirrorPort: targetPortSchema,
    connectTimeout: {
      ...targetConnectTimeoutSchema,
      default: 10 * 1000, // 10 sec
    },
    simpleTimeout: {
      ...targetSimpleTimeoutSchema,
      default: 60 * 1000, // 1 min
    },
    streamTimeout: {
      ...targetStreamTimeoutSchema,
      default: 300 * 1000, // 5 min
    },
    headersSizeLimit: {
      ...targetHeadersSizeLimitSchema,
      default: 10 * 1024, // 10 kb
    },
    bodySizeLimit: {
      ...targetBodySizeLimitSchema,
      default: 10 * 1024 * 1024, // 10 mb
    },
    mainPage: {
      ...targetContentSchema,
      default: '',
    },
    notFoundPage: {
      ...targetContentSchema,
      default: '',
    },
    faviconIco: {
      ...targetContentSchema,
      default: '',
    },
    robotsTxt: {
      ...targetContentSchema,
      default: '',
    },
    sitemapXml: {
      ...targetContentSchema,
      default: '',
    },
    allowWebSockets: {
      ...booleanSchema,
      default: false,
    },
    lockSecret: randomIdentSchema,
  },
  additionalProperties: false,
} as const

const readTargetDataSchema: JSONSchemaType<ReadTargetData> = {
  type: 'object',
  required: ['campaignId', 'targetId'],
  properties: {
    campaignId: customIdentSchema,
    targetId: customIdentSchema,
  },
  additionalProperties: false,
} as const

const updateTargetDataSchema: JSONSchemaType<UpdateTargetData> = {
  type: 'object',
  required: ['campaignId', 'targetId', 'lockSecret'],
  properties: {
    campaignId: customIdentSchema,
    targetId: customIdentSchema,
    connectTimeout: {
      ...targetConnectTimeoutSchema,
      nullable: true,
    },
    simpleTimeout: {
      ...targetSimpleTimeoutSchema,
      nullable: true,
    },
    streamTimeout: {
      ...targetStreamTimeoutSchema,
      nullable: true,
    },
    headersSizeLimit: {
      ...targetHeadersSizeLimitSchema,
      nullable: true,
    },
    bodySizeLimit: {
      ...targetBodySizeLimitSchema,
      nullable: true,
    },
    mainPage: {
      ...targetContentSchema,
      nullable: true,
    },
    notFoundPage: {
      ...targetContentSchema,
      nullable: true,
    },
    faviconIco: {
      ...targetContentSchema,
      nullable: true,
    },
    robotsTxt: {
      ...targetContentSchema,
      nullable: true,
    },
    sitemapXml: {
      ...targetContentSchema,
      nullable: true,
    },
    allowWebSockets: {
      ...booleanSchema,
      nullable: true,
    },
    lockSecret: randomIdentSchema,
  },
  additionalProperties: false,
} as const

const switchTargetDataSchema: JSONSchemaType<SwitchTargetData> = {
  type: 'object',
  required: ['campaignId', 'targetId', 'lockSecret'],
  properties: {
    campaignId: customIdentSchema,
    targetId: customIdentSchema,
    lockSecret: randomIdentSchema,
  },
  additionalProperties: false,
} as const

const actionTargetLabelDataSchema: JSONSchemaType<ActionTargetLabelData> = {
  type: 'object',
  required: ['campaignId', 'targetId', 'label', 'lockSecret'],
  properties: {
    campaignId: customIdentSchema,
    targetId: customIdentSchema,
    label: targetLabelSchema,
    lockSecret: randomIdentSchema,
  },
  additionalProperties: false,
} as const

const deleteTargetDataSchema: JSONSchemaType<DeleteTargetData> = {
  type: 'object',
  required: ['campaignId', 'targetId', 'lockSecret'],
  properties: {
    campaignId: customIdentSchema,
    targetId: customIdentSchema,
    lockSecret: randomIdentSchema,
  },
  additionalProperties: false,
} as const

const listTargetsDataSchema: JSONSchemaType<ListTargetsData> = {
  type: 'object',
  required: ['campaignId'],
  properties: {
    campaignId: customIdentSchema,
  },
  additionalProperties: false,
} as const

export const targetSchemas: ValidatorSchemas = {
  'console-create-target-data': createTargetDataSchema,
  'console-read-target-data': readTargetDataSchema,
  'console-update-target-data': updateTargetDataSchema,
  'console-switch-target-data': switchTargetDataSchema,
  'console-action-target-label-data': actionTargetLabelDataSchema,
  'console-delete-target-data': deleteTargetDataSchema,
  'console-list-targets-data': listTargetsDataSchema,
} as const
