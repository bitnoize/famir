import { JSONSchemaType, ValidatorSchemas } from '@famir/validator'
import { RawFullTarget, RawTarget } from './target.functions.js'

const rawTargetSchema: JSONSchemaType<RawTarget> = {
  type: 'object',
  required: [
    'campaign_id',
    'target_id',
    'is_landing',
    'donor_secure',
    'donor_sub',
    'donor_domain',
    'donor_port',
    'mirror_secure',
    'mirror_sub',
    'mirror_domain',
    'mirror_port',
    'labels',
    'is_enabled',
    'message_count',
    'created_at',
    'updated_at'
  ],
  properties: {
    campaign_id: {
      type: 'string'
    },
    target_id: {
      type: 'string'
    },
    is_landing: {
      type: 'integer'
    },
    donor_secure: {
      type: 'integer'
    },
    donor_sub: {
      type: 'string'
    },
    donor_domain: {
      type: 'string'
    },
    donor_port: {
      type: 'integer'
    },
    mirror_secure: {
      type: 'integer'
    },
    mirror_sub: {
      type: 'string'
    },
    mirror_domain: {
      type: 'string'
    },
    mirror_port: {
      type: 'integer'
    },
    labels: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    is_enabled: {
      type: 'integer'
    },
    message_count: {
      type: 'integer'
    },
    created_at: {
      type: 'integer'
    },
    updated_at: {
      type: 'integer'
    }
  },
  additionalProperties: false
} as const

const rawFullTargetSchema: JSONSchemaType<RawFullTarget> = {
  type: 'object',
  required: [
    'campaign_id',
    'target_id',
    'is_landing',
    'donor_secure',
    'donor_sub',
    'donor_domain',
    'donor_port',
    'mirror_secure',
    'mirror_sub',
    'mirror_domain',
    'mirror_port',
    'labels',
    'connect_timeout',
    'simple_timeout',
    'stream_timeout',
    'request_body_limit',
    'response_body_limit',
    'main_page',
    'not_found_page',
    'favicon_ico',
    'robots_txt',
    'sitemap_xml',
    'is_enabled',
    'message_count',
    'created_at',
    'updated_at'
  ],
  properties: {
    campaign_id: {
      type: 'string'
    },
    target_id: {
      type: 'string'
    },
    is_landing: {
      type: 'integer'
    },
    donor_secure: {
      type: 'integer'
    },
    donor_sub: {
      type: 'string'
    },
    donor_domain: {
      type: 'string'
    },
    donor_port: {
      type: 'integer'
    },
    mirror_secure: {
      type: 'integer'
    },
    mirror_sub: {
      type: 'string'
    },
    mirror_domain: {
      type: 'string'
    },
    mirror_port: {
      type: 'integer'
    },
    labels: {
      type: 'array',
      items: {
        type: 'string'
      }
    },
    connect_timeout: {
      type: 'integer'
    },
    simple_timeout: {
      type: 'integer'
    },
    stream_timeout: {
      type: 'integer'
    },
    request_body_limit: {
      type: 'integer'
    },
    response_body_limit: {
      type: 'integer'
    },
    main_page: {
      type: 'string'
    },
    not_found_page: {
      type: 'string'
    },
    favicon_ico: {
      type: 'string'
    },
    robots_txt: {
      type: 'string'
    },
    sitemap_xml: {
      type: 'string'
    },
    is_enabled: {
      type: 'integer'
    },
    message_count: {
      type: 'integer'
    },
    created_at: {
      type: 'integer'
    },
    updated_at: {
      type: 'integer'
    }
  },
  additionalProperties: false
} as const

export const targetSchemas: ValidatorSchemas = {
  'database-raw-target': rawTargetSchema,
  'database-raw-full-target': rawFullTargetSchema
} as const

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
  type: 'number',
  minimum: 0,
  maximum: 65535
} as const

export const targetLabelSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 3,
  maxLength: 64
}

export const targetLabelsSchema: JSONSchemaType<string[]> = {
  type: 'array',
  items: targetLabelSchema
} as const

export const targetConnectTimeoutSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1,
  maximum: 60 * 1000
} as const

export const targetSimpleTimeoutSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1 * 1000,
  maximum: 2 * 60 * 1000
} as const

export const targetStreamTimeoutSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 60 * 1000,
  maximum: 24 * 3600 * 1000
} as const

export const targetRequestBodyLimitSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1024,
  maximum: 1024 * 1024 * 1024
} as const

export const targetResponseBodyLimitSchema: JSONSchemaType<number> = {
  type: 'integer',
  minimum: 1024,
  maximum: 1024 * 1024 * 1024
} as const

export const targetContentSchema: JSONSchemaType<string> = {
  type: 'string',
  minLength: 0,
  maxLength: 10 * 1024 * 1024
} as const
