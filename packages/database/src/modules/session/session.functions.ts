import { CommandParser } from '@redis/client'
import { campaignKey, enabledProxyIndexKey, lureKey, sessionKey } from '../../database.keys.js'

/**
 * Raw session data structure.
 *
 * @category Session
 * @internal
 */
export interface RawSession {
  campaign_id: string
  session_id: string
  proxy_id: string
  secret: string
  is_upgraded: boolean
  message_count: number
  created_at: number
  authorized_at: number
}

/**
 * Redis Lua function definitions for session operations.
 *
 * @category Session
 * @internal
 */
export const sessionFunctions = {
  session: {
    create_session: {
      NUMBER_OF_KEYS: 3,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        sessionId: string,
        secret: string,
        createdAt: number
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(sessionKey(prefix, campaignId, sessionId))
        parser.pushKey(enabledProxyIndexKey(prefix, campaignId))

        parser.push(campaignId)
        parser.push(sessionId)
        parser.push(secret)
        parser.push(createdAt.toString())
      },

      transformReply: undefined as unknown as () => unknown,
    },

    read_session: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string, sessionId: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(sessionKey(prefix, campaignId, sessionId))
      },

      transformReply: undefined as unknown as () => unknown,
    },

    auth_session: {
      NUMBER_OF_KEYS: 3,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        sessionId: string,
        authorizedAt: number
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(sessionKey(prefix, campaignId, sessionId))
        parser.pushKey(enabledProxyIndexKey(prefix, campaignId))

        parser.push(authorizedAt.toString())
      },

      transformReply: undefined as unknown as () => unknown,
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

      transformReply: undefined as unknown as () => unknown,
    },
  },
} as const
