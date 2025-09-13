import { CommandParser } from '@redis/client'
import {
  campaignKey,
  lureIndexKey,
  proxyIndexKey,
  redirectorIndexKey,
  targetIndexKey
} from '../../database.keys.js'

export interface RawCampaign {
  id: string
  description: string
  landing_secret: string
  landing_auth_path: string
  landing_auth_param: string
  landing_lure_param: string
  session_cookie_name: string
  session_expire: number
  new_session_expire: number
  message_expire: number
  proxy_count: number
  target_count: number
  redirector_count: number
  lure_count: number
  session_count: number
  message_count: number
  created_at: number
  updated_at: number
}

export const campaignFunctions = {
  campaign: {
    create_campaign: {
      NUMBER_OF_KEYS: 1,

      parseCommand(
        parser: CommandParser,
        id: string,
        description: string,
        landingSecret: string,
        landingAuthPath: string,
        landingAuthParam: string,
        landingLureParam: string,
        sessionCookieName: string,
        sessionExpire: number,
        newSessionExpire: number,
        messageExpire: number
      ) {
        parser.pushKey(campaignKey(id))

        parser.push(id)
        parser.push(description)
        parser.push(landingSecret)
        parser.push(landingAuthPath)
        parser.push(landingAuthParam)
        parser.push(landingLureParam)
        parser.push(sessionCookieName)
        parser.push(sessionExpire.toString())
        parser.push(newSessionExpire.toString())
        parser.push(messageExpire.toString())
        parser.push(Date.now().toString())
      },

      transformReply: undefined as unknown as () => string
    },

    read_campaign: {
      NUMBER_OF_KEYS: 5,

      parseCommand(parser: CommandParser, id: string) {
        parser.pushKey(campaignKey(id))
        parser.pushKey(proxyIndexKey(id))
        parser.pushKey(targetIndexKey(id))
        parser.pushKey(redirectorIndexKey(id))
        parser.pushKey(lureIndexKey(id))
      },

      transformReply: undefined as unknown as () => RawCampaign | null
    },

    update_campaign: {
      NUMBER_OF_KEYS: 1,

      parseCommand(
        parser: CommandParser,
        id: string,
        description: string | null | undefined,
        sessionExpire: number | null | undefined,
        newSessionExpire: number | null | undefined,
        messageExpire: number | null | undefined
      ) {
        parser.pushKey(campaignKey(id))

        if (description != null) {
          parser.push('description')
          parser.push(description)
        }

        if (sessionExpire != null) {
          parser.push('session_expire')
          parser.push(sessionExpire.toString())
        }

        if (newSessionExpire != null) {
          parser.push('new_session_expire')
          parser.push(newSessionExpire.toString())
        }

        if (messageExpire != null) {
          parser.push('message_expire')
          parser.push(messageExpire.toString())
        }

        parser.push('updated_at')
        parser.push(Date.now().toString())
      },

      transformReply: undefined as unknown as () => string
    },

    delete_campaign: {
      NUMBER_OF_KEYS: 5,

      parseCommand(parser: CommandParser, id: string) {
        parser.pushKey(campaignKey(id))
        parser.pushKey(proxyIndexKey(id))
        parser.pushKey(targetIndexKey(id))
        parser.pushKey(redirectorIndexKey(id))
        parser.pushKey(lureIndexKey(id))
      },

      transformReply: undefined as unknown as () => string
    }
  }
} as const
