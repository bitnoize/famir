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
  booleanSchema,
  customIdentSchema,
  randomIdentSchema,
} from '@famir/validator'
import {
  DumpPhishmapArgs,
  Phishmap,
  PhishmapCampaign,
  PhishmapLure,
  PhishmapProxy,
  PhishmapRedirector,
  PhishmapTarget,
  PurgePhishmapArgs,
  RestorePhishmapArgs,
} from './phishmap.js'

/**
 * JSON Schema for validating a phishmap campaign.
 *
 * @category Phishmap
 * @internal
 */
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

/**
 * JSON Schema for validating a phishmap proxy.
 *
 * @category Phishmap
 * @internal
 */
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

/**
 * JSON Schema for validating a phishmap target.
 *
 * @category Phishmap
 * @internal
 */
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

/**
 * JSON Schema for validating a phishmap redirector.
 *
 * @category Phishmap
 * @internal
 */
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

/**
 * JSON Schema for validating a phishmap lure.
 *
 * @category Phishmap
 * @internal
 */
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

/**
 * JSON Schema for validating a phishmap.
 *
 * @category Phishmap
 * @internal
 */
export const phishmapSchema: JSONSchemaType<Phishmap> = {
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

/**
 * JSON Schema for validating a dump phishmap args.
 *
 * @category Phishmap
 * @internal
 */
export const dumpPhishmapArgsSchema: JSONSchemaType<DumpPhishmapArgs> = {
  type: 'object',
  required: ['_', 'file'],
  properties: {
    _: {
      type: 'array',
      items: [customIdentSchema],
      minItems: 1,
      maxItems: 1,
    },
    file: {
      type: 'string',
    },
  },
  additionalProperties: false,
} as const

/**
 * JSON Schema for validating a restore phishmap args.
 *
 * @category Phishmap
 * @internal
 */
export const restorePhishmapArgsSchema: JSONSchemaType<RestorePhishmapArgs> = {
  type: 'object',
  required: ['_', 'file'],
  properties: {
    _: {
      type: 'array',
      items: {
        type: 'string',
      },
      minItems: 0,
      maxItems: 0,
    },
    file: {
      type: 'string',
    },
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

/**
 * JSON Schema for validating a purge phishmap args.
 *
 * @category Phishmap
 * @internal
 */
export const purgePhishmapArgsSchema: JSONSchemaType<PurgePhishmapArgs> = {
  type: 'object',
  required: ['_'],
  properties: {
    _: {
      type: 'array',
      items: [customIdentSchema],
      minItems: 1,
      maxItems: 1,
    },
    force: booleanSchema,
  },
  additionalProperties: false,
} as const
