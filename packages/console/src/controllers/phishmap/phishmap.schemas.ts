import {
  campaignDescriptionSchema,
  campaignMessageExpireSchema,
  campaignMirrorDomainSchema,
  campaignNewSessionExpireSchema,
  campaignSessionCookieNameSchema,
  campaignSessionExpireSchema,
  campaignUpgradeSessionPathSchema,
  lurePathSchema,
  proxyUrlSchema,
  redirectorFieldsSchema,
  redirectorPageSchema,
  targetAccessLevelSchema,
  targetBodySizeLimitSchema,
  targetConnectTimeoutSchema,
  targetContentSchema,
  targetDomainSchema,
  targetHeadersSizeLimitSchema,
  targetLabelsSchema,
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
  DumpPhishmapData,
  Phishmap,
  PhishmapCampaign,
  PhishmapLure,
  PhishmapProxy,
  PhishmapRedirector,
  PhishmapTarget,
  PurgePhishmapData,
  RestorePhishmapData,
} from '../../services/index.js'

const phishmapCampaignSchema: JSONSchemaType<PhishmapCampaign> = {
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
    description: campaignDescriptionSchema,
    upgradeSessionPath: campaignUpgradeSessionPathSchema,
    sessionCookieName: campaignSessionCookieNameSchema,
    sessionExpire: campaignSessionExpireSchema,
    newSessionExpire: campaignNewSessionExpireSchema,
    messageExpire: campaignMessageExpireSchema,
  },
  additionalProperties: false,
} as const

const phishmapProxySchema: JSONSchemaType<PhishmapProxy> = {
  type: 'object',
  required: ['proxyId', 'url', 'isEnabled'],
  properties: {
    proxyId: customIdentSchema,
    url: proxyUrlSchema,
    isEnabled: booleanSchema,
  },
  additionalProperties: false,
} as const

const phishmapTargetSchema: JSONSchemaType<PhishmapTarget> = {
  type: 'object',
  required: [
    'targetId',
    'accessLevel',
    'donorSecure',
    'donorSub',
    'donorDomain',
    'donorPort',
    'mirrorSecure',
    'mirrorSub',
    'mirrorPort',
    'labels',
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
    'isEnabled',
  ],
  properties: {
    targetId: customIdentSchema,
    accessLevel: targetAccessLevelSchema,
    donorSecure: booleanSchema,
    donorSub: targetSubSchema,
    donorDomain: targetDomainSchema,
    donorPort: targetPortSchema,
    mirrorSecure: booleanSchema,
    mirrorSub: targetSubSchema,
    mirrorPort: targetPortSchema,
    labels: targetLabelsSchema,
    connectTimeout: targetConnectTimeoutSchema,
    simpleTimeout: targetSimpleTimeoutSchema,
    streamTimeout: targetStreamTimeoutSchema,
    headersSizeLimit: targetHeadersSizeLimitSchema,
    bodySizeLimit: targetBodySizeLimitSchema,
    mainPage: targetContentSchema,
    notFoundPage: targetContentSchema,
    faviconIco: targetContentSchema,
    robotsTxt: targetContentSchema,
    sitemapXml: targetContentSchema,
    allowWebSockets: booleanSchema,
    isEnabled: booleanSchema,
  },
  additionalProperties: false,
} as const

const phishmapRedirectorSchema: JSONSchemaType<PhishmapRedirector> = {
  type: 'object',
  required: ['redirectorId', 'page', 'fields'],
  properties: {
    redirectorId: customIdentSchema,
    page: redirectorPageSchema,
    fields: redirectorFieldsSchema,
    isEnabled: booleanSchema,
  },
  additionalProperties: false,
} as const

const phishmapLureSchema: JSONSchemaType<PhishmapLure> = {
  type: 'object',
  required: ['lureId', 'path', 'redirectorId', 'isEnabled'],
  properties: {
    lureId: customIdentSchema,
    path: lurePathSchema,
    redirectorId: customIdentSchema,
    isEnabled: booleanSchema,
  },
  additionalProperties: false,
} as const

const phishmapSchema: JSONSchemaType<Phishmap> = {
  type: 'object',
  required: ['campaign', 'proxies', 'targets', 'redirectors', 'lures'],
  properties: {
    campaign: phishmapCampaignSchema,
    proxies: {
      type: 'array',
      items: phishmapProxySchema,
    },
    targets: {
      type: 'array',
      items: phishmapTargetSchema,
    },
    redirectors: {
      type: 'array',
      items: phishmapRedirectorSchema,
    },
    lures: {
      type: 'array',
      items: phishmapLureSchema,
    },
  },
  additionalProperties: false,
} as const

const dumpPhishmapDataSchema: JSONSchemaType<DumpPhishmapData> = {
  type: 'object',
  required: ['campaignId'],
  properties: {
    campaignId: customIdentSchema,
  },
  additionalProperties: false,
} as const

const restorePhishmapDataSchema: JSONSchemaType<RestorePhishmapData> = {
  type: 'object',
  required: ['phishmap'],
  properties: {
    phishmap: phishmapSchema,
    campaignId: {
      ...customIdentSchema,
      nullable: true,
    },
    mirrorDomain: {
      ...campaignMirrorDomainSchema,
      nullable: true,
    },
    description: {
      ...campaignDescriptionSchema,
      nullable: true,
    },
    cryptSecret: {
      ...randomIdentSchema,
      nullable: true,
    },
    upgradeSessionPath: {
      ...campaignUpgradeSessionPathSchema,
      nullable: true,
    },
    sessionCookieName: {
      ...campaignSessionCookieNameSchema,
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
  },
  additionalProperties: false,
} as const

const purgePhishmapDataSchema: JSONSchemaType<PurgePhishmapData> = {
  type: 'object',
  required: ['campaignId'],
  properties: {
    campaignId: customIdentSchema,
  },
  additionalProperties: false,
} as const

export const phishmapSchemas: ValidatorSchemas = {
  'console-dump-phishmap-data': dumpPhishmapDataSchema,
  'console-restore-phishmap-data': restorePhishmapDataSchema,
  'console-purge-phishmap-data': purgePhishmapDataSchema,
} as const
