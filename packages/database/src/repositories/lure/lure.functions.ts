import { CommandParser } from '@redis/client'
import {
  campaignKey,
  lureIndexKey,
  lureKey,
  lurePathKey,
  redirectorKey
} from '../../database.keys.js'

export interface RawLure {
  id: string
  path: string
  redirector_id: string
  is_enabled: number
  auth_count: number
  created_at: number
  updated_at: number
}

export const lureFunctions = {
  lure: {
    create_lure: {
      NUMBER_OF_KEYS: 5,

      parseCommand(parser: CommandParser, id: string, path: string, redirector_id: string) {
        parser.pushKey(campaignKey())
        parser.pushKey(lureKey(id))
        parser.pushKey(lurePathKey(path))
        parser.pushKey(lureIndexKey())
        parser.pushKey(redirectorKey(redirector_id))

        parser.push(id)
        parser.push(path)
        parser.push(redirector_id)
        parser.push(Date.now().toString())
      },

      transformReply: undefined as unknown as () => string
    },

    read_lure: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, id: string) {
        parser.pushKey(campaignKey())
        parser.pushKey(lureKey(id))
      },

      transformReply: undefined as unknown as () => RawLure | null
    },

    read_lure_path: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, path: string) {
        parser.pushKey(campaignKey())
        parser.pushKey(lurePathKey(path))
      },

      transformReply: undefined as unknown as () => string | null
    },

    read_lure_index: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser) {
        parser.pushKey(campaignKey())
        parser.pushKey(lureIndexKey())
      },

      transformReply: undefined as unknown as () => string[] | null
    },

    enable_lure: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, id: string) {
        parser.pushKey(campaignKey())
        parser.pushKey(lureKey(id))
      },

      transformReply: undefined as unknown as () => string
    },

    disable_lure: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, id: string) {
        parser.pushKey(campaignKey())
        parser.pushKey(lureKey(id))
      },

      transformReply: undefined as unknown as () => string
    },

    delete_lure: {
      NUMBER_OF_KEYS: 5,

      parseCommand(parser: CommandParser, id: string, path: string, redirector_id: string) {
        parser.pushKey(campaignKey())
        parser.pushKey(lureKey(id))
        parser.pushKey(lurePathKey(path))
        parser.pushKey(lureIndexKey())
        parser.pushKey(redirectorKey(redirector_id))
      },

      transformReply: undefined as unknown as () => string
    }
  }
} as const
