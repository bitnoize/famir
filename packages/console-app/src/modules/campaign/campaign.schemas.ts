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
import { JSONSchemaType, booleanSchema, customIdentSchema, secretSchema } from '@famir/validator'
import {
  CreateCampaignArgs,
  DeleteCampaignArgs,
  ListCampaignsArgs,
  RawCampaignTemplate,
  RawCampaignTemplateCampaign,
  RawCampaignTemplateLure,
  RawCampaignTemplateProxy,
  RawCampaignTemplateRedirector,
  RawCampaignTemplateTarget,
  ReadCampaignArgs,
  UpdateCampaignArgs,
} from './campaign.js'

/**
 * @category Campaign
 * @internal
 */
export const createCampaignArgsSchema: JSONSchemaType<CreateCampaignArgs> = {
  type: 'object',
  required: ['_', 'assetName'],
  properties: {
    _: {
      type: 'array',
      items: [customIdentSchema],
      minItems: 1,
      maxItems: 1,
    },
    assetName: {
      type: 'string',
    },
    mirrorDomain: {
      ...campaignMirrorDomainSchema,
      nullable: true,
    },
    cryptSecret: {
      ...secretSchema,
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
  },
  additionalProperties: false,
} as const

/**
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
} as const

/**
 * @category Campaign
 * @internal
 */
export const updateCampaignArgsSchema: JSONSchemaType<UpdateCampaignArgs> = {
  type: 'object',
  required: ['_', 'assetName'],
  properties: {
    _: {
      type: 'array',
      items: [customIdentSchema],
      minItems: 1,
      maxItems: 1,
    },
    assetName: {
      type: 'string',
    },
  },
  additionalProperties: false,
} as const

/**
 * @category Campaign
 * @internal
 */
export const deleteCampaignArgsSchema: JSONSchemaType<DeleteCampaignArgs> = {
  type: 'object',
  required: ['_'],
  properties: {
    _: {
      type: 'array',
      items: [customIdentSchema],
      minItems: 1,
      maxItems: 1,
    },
    force: {
      ...booleanSchema,
      nullable: true,
    },
  },
  additionalProperties: false,
} as const

/**
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

/**
 * @category Campaign
 * @internal
 */
const rawCampaignTemplateCampaignSchema: JSONSchemaType<RawCampaignTemplateCampaign> = {
  type: 'object',
  required: ['mirrorDomain'],
  properties: {
    mirrorDomain: campaignMirrorDomainSchema,
    description: {
      ...campaignDescriptionSchema,
      nullable: true,
    },
    cryptSecret: {
      ...secretSchema,
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
 * @category Campaign
 * @internal
 */
const rawCampaignTemplateProxySchema: JSONSchemaType<RawCampaignTemplateProxy> = {
  type: 'object',
  required: ['proxyId', 'url'],
  properties: {
    proxyId: customIdentSchema,
    url: proxyUrlSchema,
    isEnabled: {
      ...booleanSchema,
      nullable: true,
    },
  },
  additionalProperties: false,
} as const

/**
 * @category Campaign
 * @internal
 */
const rawCampaignTemplateTargetSchema: JSONSchemaType<RawCampaignTemplateTarget> = {
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
    labels: {
      ...targetLabelsSchema,
      nullable: true,
    },
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
    isEnabled: {
      ...booleanSchema,
      nullable: true,
    },
  },
  additionalProperties: false,
} as const

/**
 * @category Campaign
 * @internal
 */
const rawCampaignTemplateRedirectorSchema: JSONSchemaType<RawCampaignTemplateRedirector> = {
  type: 'object',
  required: ['redirectorId'],
  properties: {
    redirectorId: customIdentSchema,
    page: {
      ...redirectorPageSchema,
      nullable: true,
    },
    fields: {
      ...redirectorFieldsSchema,
      nullable: true,
    },
  },
  additionalProperties: false,
} as const

/**
 * @category Campaign
 * @internal
 */
const rawCampaignTemplateLureSchema: JSONSchemaType<RawCampaignTemplateLure> = {
  type: 'object',
  required: ['lureId', 'path', 'redirectorId'],
  properties: {
    lureId: customIdentSchema,
    path: lurePathSchema,
    redirectorId: customIdentSchema,
    isEnabled: {
      ...booleanSchema,
      nullable: true,
    },
  },
  additionalProperties: false,
} as const

/**
 * @category Campaign
 * @internal
 */
export const rawCampaignTemplateSchema: JSONSchemaType<RawCampaignTemplate> = {
  type: 'object',
  required: ['campaign'],
  properties: {
    campaign: rawCampaignTemplateCampaignSchema,
    proxies: {
      type: 'array',
      items: rawCampaignTemplateProxySchema,
      nullable: true,
    },
    targets: {
      type: 'array',
      items: rawCampaignTemplateTargetSchema,
      nullable: true,
    },
    redirectors: {
      type: 'array',
      items: rawCampaignTemplateRedirectorSchema,
      nullable: true,
    },
    lures: {
      type: 'array',
      items: rawCampaignTemplateLureSchema,
      nullable: true,
    },
  },
  additionalProperties: false,
} as const
