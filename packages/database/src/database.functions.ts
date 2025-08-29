import { campaignFunctions } from './repositories/campaign/campaign.functions.js'
import { lureFunctions } from './repositories/lure/lure.functions.js'
import { proxyFunctions } from './repositories/proxy/proxy.functions.js'
import { redirectorFunctions } from './repositories/redirector/redirector.functions.js'
import { targetFunctions } from './repositories/target/target.functions.js'
//import { sessionFunctions } from './repositories/session/session.functions.js'
//import { messageFunctions } from './repositories/message/message.functions.js'

export const databaseFunctions = {
  ...campaignFunctions,
  ...proxyFunctions,
  ...targetFunctions,
  ...redirectorFunctions,
  ...lureFunctions
  //...sessionFunctions,
  //...messageFunctions
} as const

export type DatabaseFunctions = typeof databaseFunctions
