import { CommandParser } from '@redis/client'
import {
  campaignKey,
  lureIndexKey,
  lureKey,
  lurePathKey,
  redirectorKey
} from '../../database.keys.js'

export interface RawLure {
  campaign_id: string
  id: string
  path: string
  redirector_id: string
  is_enabled: number
  session_count: number
  created_at: number
  updated_at: number
}

export const lureFunctions = {
  lure: {
    create_lure: {
      NUMBER_OF_KEYS: 5,

      parseCommand(
        parser: CommandParser,
        campaignId: string,
        id: string,
        path: string,
        redirectorId: string
      ) {
        parser.pushKey(campaignKey(campaignId))
        parser.pushKey(lureKey(campaignId, id))
        parser.pushKey(lurePathKey(campaignId, path))
        parser.pushKey(lureIndexKey(campaignId))
        parser.pushKey(redirectorKey(campaignId, redirectorId))

        parser.push(campaignId)
        parser.push(id)
        parser.push(path)
        parser.push(redirectorId)
        parser.push(Date.now().toString())
      },

      transformReply: undefined as unknown as () => string
    },

    read_lure: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, campaignId: string, id: string) {
        parser.pushKey(campaignKey(campaignId))
        parser.pushKey(lureKey(campaignId, id))
      },

      transformReply: undefined as unknown as () => RawLure | null
    },

    read_lure_path: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, campaignId: string, path: string) {
        parser.pushKey(campaignKey(campaignId))
        parser.pushKey(lurePathKey(campaignId, path))
      },

      transformReply: undefined as unknown as () => string | null
    },

    read_lure_index: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, campaignId: string) {
        parser.pushKey(campaignKey(campaignId))
        parser.pushKey(lureIndexKey(campaignId))
      },

      transformReply: undefined as unknown as () => string[] | null
    },

    enable_lure: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, campaignId: string, id: string) {
        parser.pushKey(campaignKey(campaignId))
        parser.pushKey(lureKey(campaignId, id))

        parser.push(Date.now().toString())
      },

      transformReply: undefined as unknown as () => string
    },

    disable_lure: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, campaignId: string, id: string) {
        parser.pushKey(campaignKey(campaignId))
        parser.pushKey(lureKey(campaignId, id))

        parser.push(Date.now().toString())
      },

      transformReply: undefined as unknown as () => string
    },

    delete_lure: {
      NUMBER_OF_KEYS: 5,

      parseCommand(
        parser: CommandParser,
        campaignId: string,
        id: string,
        path: string,
        redirectorId: string
      ) {
        parser.pushKey(campaignKey(campaignId))
        parser.pushKey(lureKey(campaignId, id))
        parser.pushKey(lurePathKey(campaignId, path))
        parser.pushKey(lureIndexKey(campaignId))
        parser.pushKey(redirectorKey(campaignId, redirectorId))
      },

      transformReply: undefined as unknown as () => string
    }
  }
} as const
