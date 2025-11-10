import { CommandParser } from '@redis/client'
import { campaignKey, redirectorIndexKey, redirectorKey } from '../../database.keys.js'

export interface RawRedirector {
  campaign_id: string
  redirector_id: string
  page: string
  lure_count: number
  created_at: number
  updated_at: number
}

export const redirectorFunctions = {
  redirector: {
    create_redirector: {
      NUMBER_OF_KEYS: 3,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        redirectorId: string,
        page: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(redirectorKey(prefix, campaignId, redirectorId))
        parser.pushKey(redirectorIndexKey(prefix, campaignId))

        parser.push(campaignId)
        parser.push(redirectorId)
        parser.push(page)
        parser.push(Date.now().toString())
      },

      transformReply: undefined as unknown as () => unknown
    },

    read_redirector: {
      NUMBER_OF_KEYS: 2,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        redirectorId: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(redirectorKey(prefix, campaignId, redirectorId))
      },

      transformReply: undefined as unknown as () => unknown
    },

    read_redirector_index: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(redirectorIndexKey(prefix, campaignId))
      },

      transformReply: undefined as unknown as () => unknown
    },

    update_redirector: {
      NUMBER_OF_KEYS: 2,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        redirectorId: string,
        page: string | null | undefined
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(redirectorKey(prefix, campaignId, redirectorId))

        if (page != null) {
          parser.push('page')
          parser.push(page)
        }

        parser.push('updated_at')
        parser.push(Date.now().toString())
      },

      transformReply: undefined as unknown as () => unknown
    },

    delete_redirector: {
      NUMBER_OF_KEYS: 3,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        redirectorId: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(redirectorKey(prefix, campaignId, redirectorId))
        parser.pushKey(redirectorIndexKey(prefix, campaignId))
      },

      transformReply: undefined as unknown as () => unknown
    }
  }
} as const
