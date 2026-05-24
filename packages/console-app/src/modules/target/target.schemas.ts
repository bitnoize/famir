import {
  targetAccessLevelSchema,
  targetBodySizeLimitSchema,
  targetConnectTimeoutSchema,
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
  booleanSchema,
  customIdentSchema,
  randomIdentSchema,
} from '@famir/validator'
import {
  AlterTargetLabelArgs,
  CreateTargetArgs,
  DeleteTargetArgs,
  ListTargetsArgs,
  ReadTargetArgs,
  ReadTargetHostsArgs,
  ToggleTargetArgs,
  UpdateTargetArgs,
} from './target.js'

/**
 * JSON Schema for validating a create target args.
 *
 * @category Target
 * @internal
 */
export const createTargetArgsSchema: JSONSchemaType<CreateTargetArgs> = {
  type: 'object',
  required: [
    '_',
    'accessLevel',
    'donorSecure',
    'donorSub',
    'donorDomain',
    'mirrorSecure',
    'mirrorSub',
    'connectTimeout',
    'simpleTimeout',
    'streamTimeout',
    'headersSizeLimit',
    'bodySizeLimit',
    'allowWebSockets',
    'lockSecret',
  ],
  properties: {
    _: {
      type: 'array',
      items: [customIdentSchema, customIdentSchema],
      minItems: 2,
      maxItems: 2,
    },
    accessLevel: targetAccessLevelSchema,
    donorSecure: booleanSchema,
    donorSub: targetSubSchema,
    donorDomain: targetDomainSchema,
    donorPort: {
      ...targetPortSchema,
      nullable: true,
    },
    mirrorSecure: booleanSchema,
    mirrorSub: targetSubSchema,
    mirrorPort: {
      ...targetPortSchema,
      nullable: true,
    },
    connectTimeout: targetConnectTimeoutSchema,
    simpleTimeout: targetSimpleTimeoutSchema,
    streamTimeout: targetStreamTimeoutSchema,
    headersSizeLimit: targetHeadersSizeLimitSchema,
    bodySizeLimit: targetBodySizeLimitSchema,
    mainPageFile: {
      type: 'string',
      nullable: true,
    },
    notFoundPageFile: {
      type: 'string',
      nullable: true,
    },
    faviconIcoFile: {
      type: 'string',
      nullable: true,
    },
    robotsTxtFile: {
      type: 'string',
      nullable: true,
    },
    sitemapXmlFile: {
      type: 'string',
      nullable: true,
    },
    allowWebSockets: booleanSchema,
    lockSecret: randomIdentSchema,
  },
  additionalProperties: false,
} as const

/**
 * JSON Schema for validating a read target args.
 *
 * @category Target
 * @internal
 */
export const readTargetArgsSchema: JSONSchemaType<ReadTargetArgs> = {
  type: 'object',
  required: ['_'],
  properties: {
    _: {
      type: 'array',
      items: [customIdentSchema, customIdentSchema],
      minItems: 2,
      maxItems: 2,
    },
  },
  additionalProperties: false,
} as const

/**
 * JSON Schema for validating a read target hosts args.
 *
 * @category Target
 * @internal
 */
export const readTargetHostsArgsSchema: JSONSchemaType<ReadTargetHostsArgs> = {
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
 * JSON Schema for validating an update target args.
 *
 * @category Target
 * @internal
 */
export const updateTargetArgsSchema: JSONSchemaType<UpdateTargetArgs> = {
  type: 'object',
  required: ['_', 'lockSecret'],
  properties: {
    _: {
      type: 'array',
      items: [customIdentSchema, customIdentSchema],
      minItems: 2,
      maxItems: 2,
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
    mainPageFile: {
      type: 'string',
      nullable: true,
    },
    notFoundPageFile: {
      type: 'string',
      nullable: true,
    },
    faviconIcoFile: {
      type: 'string',
      nullable: true,
    },
    robotsTxtFile: {
      type: 'string',
      nullable: true,
    },
    sitemapXmlFile: {
      type: 'string',
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

/**
 * JSON Schema for validating a toggle target args.
 *
 * @category Target
 * @internal
 */
export const toggleTargetArgsSchema: JSONSchemaType<ToggleTargetArgs> = {
  type: 'object',
  required: ['_', 'lockSecret'],
  properties: {
    _: {
      type: 'array',
      items: [customIdentSchema, customIdentSchema],
      minItems: 2,
      maxItems: 2,
    },
    lockSecret: randomIdentSchema,
  },
  additionalProperties: false,
} as const

/**
 * JSON Schema for validating an alter target args.
 *
 * @category Target
 * @internal
 */
export const alterTargetLabelArgsSchema: JSONSchemaType<AlterTargetLabelArgs> = {
  type: 'object',
  required: ['_', 'label', 'lockSecret'],
  properties: {
    _: {
      type: 'array',
      items: [customIdentSchema, customIdentSchema],
      minItems: 2,
      maxItems: 2,
    },
    label: targetLabelSchema,
    lockSecret: randomIdentSchema,
  },
  additionalProperties: false,
} as const

/**
 * JSON Schema for validating a delete target args.
 *
 * @category Target
 * @internal
 */
export const deleteTargetArgsSchema: JSONSchemaType<DeleteTargetArgs> = {
  type: 'object',
  required: ['_', 'lockSecret'],
  properties: {
    _: {
      type: 'array',
      items: [customIdentSchema, customIdentSchema],
      minItems: 2,
      maxItems: 2,
    },
    lockSecret: randomIdentSchema,
  },
  additionalProperties: false,
} as const

/**
 * JSON Schema for validating a list targets args.
 *
 * @category Target
 * @internal
 */
export const listTargetsArgsSchema: JSONSchemaType<ListTargetsArgs> = {
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
