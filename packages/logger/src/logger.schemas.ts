import { JSONSchemaType } from '@famir/validator'

/**
 * @category Schemas
 * @internal
 */
export const configLoggerAppNameSchema: JSONSchemaType<string> = {
  type: 'string',
}

/**
 * @category Schemas
 * @internal
 */
export const configLoggerLogLevelSchema: JSONSchemaType<string> = {
  type: 'string',
} as const
