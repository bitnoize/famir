import { JSONSchemaType } from '@famir/validator'

export const configLoggerAppNameSchema: JSONSchemaType<string> = {
  type: 'string'
}

export const configLoggerLogLevelSchema: JSONSchemaType<string> = {
  type: 'string'
} as const
