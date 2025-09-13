import { CommandParser } from '@redis/client'
import {
  campaignKey,
  enabledProxyIndexKey,
  proxyIndexKey,
  proxyKey,
  proxyUniqueUrlKey
} from '../../database.keys.js'

export interface RawProxy {
  campaign_id: string
  id: string
  url: string
  is_enabled: number
  message_count: number
  created_at: number
  updated_at: number
}

export const proxyFunctions = {
  proxy: {
    create_proxy: {
      NUMBER_OF_KEYS: 4,

      parseCommand(parser: CommandParser, campaignId: string, id: string, url: string) {
        parser.pushKey(campaignKey(campaignId))
        parser.pushKey(proxyKey(campaignId, id))
        parser.pushKey(proxyUniqueUrlKey(campaignId))
        parser.pushKey(proxyIndexKey(campaignId))

        parser.push(campaignId)
        parser.push(id)
        parser.push(url)
        parser.push(Date.now().toString())
      },

      transformReply: undefined as unknown as () => string
    },

    read_proxy: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, campaignId: string, id: string) {
        parser.pushKey(campaignKey(campaignId))
        parser.pushKey(proxyKey(campaignId, id))
      },

      transformReply: undefined as unknown as () => RawProxy | null
    },

    read_proxy_index: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, campaignId: string) {
        parser.pushKey(campaignKey(campaignId))
        parser.pushKey(proxyIndexKey(campaignId))
      },

      transformReply: undefined as unknown as () => string[] | null
    },

    enable_proxy: {
      NUMBER_OF_KEYS: 3,

      parseCommand(parser: CommandParser, campaignId: string, id: string) {
        parser.pushKey(campaignKey(campaignId))
        parser.pushKey(proxyKey(campaignId, id))
        parser.pushKey(enabledProxyIndexKey(campaignId))

        parser.push(Date.now().toString())
      },

      transformReply: undefined as unknown as () => string
    },

    disable_proxy: {
      NUMBER_OF_KEYS: 3,

      parseCommand(parser: CommandParser, campaignId: string, id: string) {
        parser.pushKey(campaignKey(campaignId))
        parser.pushKey(proxyKey(campaignId, id))
        parser.pushKey(enabledProxyIndexKey(campaignId))

        parser.push(Date.now().toString())
      },

      transformReply: undefined as unknown as () => string
    },

    delete_proxy: {
      NUMBER_OF_KEYS: 4,

      parseCommand(parser: CommandParser, campaignId: string, id: string) {
        parser.pushKey(campaignKey(campaignId))
        parser.pushKey(proxyKey(campaignId, id))
        parser.pushKey(proxyUniqueUrlKey(campaignId))
        parser.pushKey(proxyIndexKey(campaignId))
      },

      transformReply: undefined as unknown as () => string
    }
  }
} as const
