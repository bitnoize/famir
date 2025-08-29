import { CommandParser } from '@redis/client'
import { campaignKey, proxyIndexKey, proxyKey, proxyUniqueUrlKey } from '../../database.keys.js'

export interface RawProxy {
  id: string
  url: string
  is_enabled: number
  total_count: number
  success_count: number
  failure_count: number
  created_at: number
  updated_at: number
}

export const proxyFunctions = {
  proxy: {
    create_proxy: {
      NUMBER_OF_KEYS: 4,

      parseCommand(parser: CommandParser, id: string, url: string) {
        parser.pushKey(campaignKey())
        parser.pushKey(proxyKey(id))
        parser.pushKey(proxyUniqueUrlKey())
        parser.pushKey(proxyIndexKey())

        parser.push(id)
        parser.push(url)
        parser.push(Date.now().toString())
      },

      transformReply: undefined as unknown as () => string
    },

    read_proxy: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, id: string) {
        parser.pushKey(campaignKey())
        parser.pushKey(proxyKey(id))
      },

      transformReply: undefined as unknown as () => RawProxy | null
    },

    read_proxy_index: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser) {
        parser.pushKey(campaignKey())
        parser.pushKey(proxyIndexKey())
      },

      transformReply: undefined as unknown as () => string[] | null
    },

    enable_proxy: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, id: string) {
        parser.pushKey(campaignKey())
        parser.pushKey(proxyKey(id))

        parser.push(Date.now().toString())
      },

      transformReply: undefined as unknown as () => string
    },

    disable_proxy: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, id: string) {
        parser.pushKey(campaignKey())
        parser.pushKey(proxyKey(id))

        parser.push(Date.now().toString())
      },

      transformReply: undefined as unknown as () => string
    },

    delete_proxy: {
      NUMBER_OF_KEYS: 4,

      parseCommand(parser: CommandParser, id: string) {
        parser.pushKey(campaignKey())
        parser.pushKey(proxyKey(id))
        parser.pushKey(proxyUniqueUrlKey())
        parser.pushKey(proxyIndexKey())
      },

      transformReply: undefined as unknown as () => string
    }
  }
} as const
