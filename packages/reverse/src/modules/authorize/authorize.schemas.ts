import { redirectorParamsSchema, upgradeSessionParamsSchema } from '@famir/database'
import { ValidatorSchemas, randomIdentSchema } from '@famir/validator'

export const authorizeSchemas: ValidatorSchemas = {
  'reverse-authorize-session-cookie': randomIdentSchema,
  'reverse-authorize-upgrade-session-params': upgradeSessionParamsSchema,
  'reverse-authorize-redirector-params': redirectorParamsSchema,
} as const
