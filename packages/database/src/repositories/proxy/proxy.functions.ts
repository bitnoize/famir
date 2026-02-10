import { CommandParser } from '@redis/client'
import {
  campaignKey,
  campaignLockKey,
  enabledProxyIndexKey,
  proxyIndexKey,
  proxyKey,
  proxyUniqueUrlKey
} from '../../database.keys.js'

export interface RawProxy {
  campaign_id: string
  proxy_id: string
  url: string
  is_enabled: number
  message_count: number
  created_at: number
  updated_at: number
}

export const proxyFunctions = {
  proxy: {
    create_proxy: {
      NUMBER_OF_KEYS: 5,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        proxyId: string,
        url: string,
        lockSecret: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))
        parser.pushKey(proxyKey(prefix, campaignId, proxyId))
        parser.pushKey(proxyUniqueUrlKey(prefix, campaignId))
        parser.pushKey(proxyIndexKey(prefix, campaignId))

        parser.push(campaignId)
        parser.push(proxyId)
        parser.push(url)
        parser.push(Date.now().toString())
        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => unknown
    },

    read_proxy: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string, proxyId: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(proxyKey(prefix, campaignId, proxyId))
      },

      transformReply: undefined as unknown as () => unknown
    },

    read_proxy_index: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(proxyIndexKey(prefix, campaignId))
      },

      transformReply: undefined as unknown as () => unknown
    },

    enable_proxy: {
      NUMBER_OF_KEYS: 4,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        proxyId: string,
        lockSecret: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))
        parser.pushKey(proxyKey(prefix, campaignId, proxyId))
        parser.pushKey(enabledProxyIndexKey(prefix, campaignId))

        parser.push(Date.now().toString())
        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => unknown
    },

    disable_proxy: {
      NUMBER_OF_KEYS: 4,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        proxyId: string,
        lockSecret: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))
        parser.pushKey(proxyKey(prefix, campaignId, proxyId))
        parser.pushKey(enabledProxyIndexKey(prefix, campaignId))

        parser.push(Date.now().toString())
        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => unknown
    },

    delete_proxy: {
      NUMBER_OF_KEYS: 5,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        proxyId: string,
        lockSecret: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))
        parser.pushKey(proxyKey(prefix, campaignId, proxyId))
        parser.pushKey(proxyUniqueUrlKey(prefix, campaignId))
        parser.pushKey(proxyIndexKey(prefix, campaignId))

        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => unknown
    }
  }
} as const
