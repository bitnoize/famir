import { campaignFunctions } from './modules/campaign/campaign.functions.js'
import { lureFunctions } from './modules/lure/lure.functions.js'
import { messageFunctions } from './modules/message/message.functions.js'
import { proxyFunctions } from './modules/proxy/proxy.functions.js'
import { redirectorFunctions } from './modules/redirector/redirector.functions.js'
import { sessionFunctions } from './modules/session/session.functions.js'
import { targetFunctions } from './modules/target/target.functions.js'

/**
 * @category none
 * @internal
 */
export const databaseFunctions = {
  ...campaignFunctions,
  ...proxyFunctions,
  ...targetFunctions,
  ...redirectorFunctions,
  ...lureFunctions,
  ...sessionFunctions,
  ...messageFunctions,
} as const

/**
 * @category none
 * @internal
 */
export type DatabaseFunctions = typeof databaseFunctions
