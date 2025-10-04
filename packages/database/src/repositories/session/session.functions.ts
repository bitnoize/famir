import { CommandParser } from '@redis/client'
import { campaignKey, enabledProxyIndexKey, lureKey, sessionKey } from '../../database.keys.js'

export interface RawSession {
  campaign_id: string
  session_id: string
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

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        sessionId: string,
        secret: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(sessionKey(prefix, campaignId, sessionId))
        parser.pushKey(enabledProxyIndexKey(prefix, campaignId))

        parser.push(campaignId)
        parser.push(sessionId)
        parser.push(secret)
        parser.push(Date.now().toString())
      },

      transformReply: undefined as unknown as () => string
    },

    read_session: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string, sessionId: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(sessionKey(prefix, campaignId, sessionId))
      },

      transformReply: undefined as unknown as () => RawSession | null
    },

    auth_session: {
      NUMBER_OF_KEYS: 3,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string, sessionId: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(sessionKey(prefix, campaignId, sessionId))
        parser.pushKey(enabledProxyIndexKey(prefix, campaignId))

        parser.push(Date.now().toString())
      },

      transformReply: undefined as unknown as () => string
    },

    upgrade_session: {
      NUMBER_OF_KEYS: 3,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        lureId: string,
        sessionId: string,
        secret: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(lureKey(prefix, campaignId, lureId))
        parser.pushKey(sessionKey(prefix, campaignId, sessionId))

        parser.push(secret)
      },

      transformReply: undefined as unknown as () => string
    }
  }
} as const
