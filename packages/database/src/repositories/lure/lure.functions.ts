import { CommandParser } from '@redis/client'
import {
  campaignKey,
  campaignLockKey,
  lureIndexKey,
  lureKey,
  lurePathsKey,
  redirectorKey
} from '../../database.keys.js'

export interface RawLure {
  campaign_id: string
  lure_id: string
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
      NUMBER_OF_KEYS: 6,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        lureId: string,
        path: string,
        redirectorId: string,
        lockSecret: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))
        parser.pushKey(lureKey(prefix, campaignId, lureId))
        parser.pushKey(lurePathsKey(prefix, campaignId))
        parser.pushKey(lureIndexKey(prefix, campaignId))
        parser.pushKey(redirectorKey(prefix, campaignId, redirectorId))

        parser.push(campaignId)
        parser.push(lureId)
        parser.push(path)
        parser.push(redirectorId)
        parser.push(Date.now().toString())
        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => unknown
    },

    read_lure: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string, lureId: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(lureKey(prefix, campaignId, lureId))
      },

      transformReply: undefined as unknown as () => unknown
    },

    find_lure_id: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string, path: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(lurePathsKey(prefix, campaignId))

        parser.push(path)
      },

      transformReply: undefined as unknown as () => unknown
    },

    read_lure_index: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(lureIndexKey(prefix, campaignId))
      },

      transformReply: undefined as unknown as () => unknown
    },

    enable_lure: {
      NUMBER_OF_KEYS: 3,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        lureId: string,
        lockSecret: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))
        parser.pushKey(lureKey(prefix, campaignId, lureId))

        parser.push(Date.now().toString())
        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => unknown
    },

    disable_lure: {
      NUMBER_OF_KEYS: 3,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        lureId: string,
        lockSecret: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))
        parser.pushKey(lureKey(prefix, campaignId, lureId))

        parser.push(Date.now().toString())
        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => unknown
    },

    delete_lure: {
      NUMBER_OF_KEYS: 6,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        lureId: string,
        redirectorId: string,
        lockSecret: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))
        parser.pushKey(lureKey(prefix, campaignId, lureId))
        parser.pushKey(lurePathsKey(prefix, campaignId))
        parser.pushKey(lureIndexKey(prefix, campaignId))
        parser.pushKey(redirectorKey(prefix, campaignId, redirectorId))

        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => unknown
    }
  }
} as const
