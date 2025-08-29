import { CommandParser } from '@redis/client'
import { campaignKey, redirectorIndexKey, redirectorKey } from '../../database.keys.js'

export interface RawRedirector {
  id: string
  page: string
  lure_count: number
  created_at: number
  updated_at: number
}

export const redirectorFunctions = {
  redirector: {
    create_redirector: {
      NUMBER_OF_KEYS: 3,

      parseCommand(parser: CommandParser, id: string, page: string) {
        parser.pushKey(campaignKey())
        parser.pushKey(redirectorKey(id))
        parser.pushKey(redirectorIndexKey())

        parser.push(id)
        parser.push(page)
        parser.push(Date.now().toString())
      },

      transformReply: undefined as unknown as () => string
    },

    read_redirector: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, id: string) {
        parser.pushKey(campaignKey())
        parser.pushKey(redirectorKey(id))
      },

      transformReply: undefined as unknown as () => RawRedirector | null
    },

    read_redirector_index: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser) {
        parser.pushKey(campaignKey())
        parser.pushKey(redirectorIndexKey())
      },

      transformReply: undefined as unknown as () => string[] | null
    },

    update_redirector: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, id: string, page: string | null | undefined) {
        parser.pushKey(campaignKey())
        parser.pushKey(redirectorKey(id))

        if (page != null) {
          parser.push('page')
          parser.push(page)
        }

        parser.push('updated_at')
        parser.push(Date.now().toString())
      },

      transformReply: undefined as unknown as () => string
    },

    delete_redirector: {
      NUMBER_OF_KEYS: 3,

      parseCommand(parser: CommandParser, id: string) {
        parser.pushKey(campaignKey())
        parser.pushKey(redirectorKey(id))
        parser.pushKey(redirectorIndexKey())
      },

      transformReply: undefined as unknown as () => string
    }
  }
} as const
