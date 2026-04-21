import { JSONSchemaType } from '@famir/validator'

/**
 * @category none
 * @internal
 */
export const configLoggerAppNameSchema: JSONSchemaType<string> = {
  type: 'string',
}

/**
 * @category none
 * @internal
 */
export const configLoggerLogLevelSchema: JSONSchemaType<string> = {
  type: 'string',
} as const
