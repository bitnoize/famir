import { CommandParser } from '@redis/client'
import { campaignKey, enabledProxyIndexKey, lureKey, sessionKey } from '../../database.keys.js'

export interface RawSession {
  campaign_id: string
  id: string
  proxy_id: string
  secret: string
  is_landing: number
  message_count: number
  created_at: number
  last_auth_at: number
}

export const sessionFunctions = {
  session: {
    create_session: {
      NUMBER_OF_KEYS: 3,

      parseCommand(parser: CommandParser, campaignId: string, id: string, secret: string) {
        parser.pushKey(campaignKey(campaignId))
        parser.pushKey(sessionKey(campaignId, id))
        parser.pushKey(enabledProxyIndexKey(campaignId))

        parser.push(campaignId)
        parser.push(id)
        parser.push(secret)
        parser.push(Date.now().toString())
      },

      transformReply: undefined as unknown as () => string
    },

    read_session: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, campaignId: string, id: string) {
        parser.pushKey(campaignKey(campaignId))
        parser.pushKey(sessionKey(campaignId, id))
      },

      transformReply: undefined as unknown as () => RawSession | null
    },

    auth_session: {
      NUMBER_OF_KEYS: 3,

      parseCommand(parser: CommandParser, campaignId: string, id: string) {
        parser.pushKey(campaignKey(campaignId))
        parser.pushKey(sessionKey(campaignId, id))
        parser.pushKey(enabledProxyIndexKey(campaignId))

        parser.push(Date.now().toString())
      },

      transformReply: undefined as unknown as () => string
    },

    upgrade_session: {
      NUMBER_OF_KEYS: 3,

      parseCommand(
        parser: CommandParser,
        campaignId: string,
        lureId: string,
        id: string,
        secret: string
      ) {
        parser.pushKey(campaignKey(campaignId))
        parser.pushKey(lureKey(campaignId, lureId))
        parser.pushKey(sessionKey(campaignId, id))

        parser.push(secret)
      },

      transformReply: undefined as unknown as () => string
    }
  }
} as const
