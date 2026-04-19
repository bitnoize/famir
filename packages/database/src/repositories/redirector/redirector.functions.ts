import { CommandParser } from '@redis/client'
import {
  campaignKey,
  campaignLockKey,
  redirectorFieldsKey,
  redirectorIndexKey,
  redirectorKey,
} from '../../database.keys.js'

/**
 * @category Repositories
 * @internal
 */
export interface RawRedirector {
  campaign_id: string
  redirector_id: string
  lure_count: number
  created_at: number
}

/**
 * @category Repositories
 * @internal
 */
export interface RawFullRedirector extends RawRedirector {
  page: string
  fields: string[]
}

/**
 * @category Repositories
 * @internal
 */
export const redirectorFunctions = {
  redirector: {
    create_redirector: {
      NUMBER_OF_KEYS: 4,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        redirectorId: string,
        page: string,
        createdAt: string,
        lockSecret: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))
        parser.pushKey(redirectorKey(prefix, campaignId, redirectorId))
        parser.pushKey(redirectorIndexKey(prefix, campaignId))

        parser.push(campaignId)
        parser.push(redirectorId)
        parser.push(page)
        parser.push(createdAt)
        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => unknown,
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

      transformReply: undefined as unknown as () => unknown,
    },

    read_full_redirector: {
      NUMBER_OF_KEYS: 3,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        redirectorId: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(redirectorKey(prefix, campaignId, redirectorId))
        parser.pushKey(redirectorFieldsKey(prefix, campaignId, redirectorId))
      },

      transformReply: undefined as unknown as () => unknown,
    },

    read_redirector_index: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(redirectorIndexKey(prefix, campaignId))
      },

      transformReply: undefined as unknown as () => unknown,
    },

    update_redirector: {
      NUMBER_OF_KEYS: 3,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        redirectorId: string,
        page: string | null,
        lockSecret: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))
        parser.pushKey(redirectorKey(prefix, campaignId, redirectorId))

        if (page != null) {
          parser.push('page')
          parser.push(page)
        }

        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => unknown,
    },

    append_redirector_field: {
      NUMBER_OF_KEYS: 4,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        redirectorId: string,
        field: string,
        lockSecret: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))
        parser.pushKey(redirectorKey(prefix, campaignId, redirectorId))
        parser.pushKey(redirectorFieldsKey(prefix, campaignId, redirectorId))

        parser.push(field)
        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => unknown,
    },

    remove_redirector_field: {
      NUMBER_OF_KEYS: 4,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        redirectorId: string,
        field: string,
        lockSecret: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))
        parser.pushKey(redirectorKey(prefix, campaignId, redirectorId))
        parser.pushKey(redirectorFieldsKey(prefix, campaignId, redirectorId))

        parser.push(field)
        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => unknown,
    },

    delete_redirector: {
      NUMBER_OF_KEYS: 5,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        redirectorId: string,
        lockSecret: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(campaignLockKey(prefix, campaignId))
        parser.pushKey(redirectorKey(prefix, campaignId, redirectorId))
        parser.pushKey(redirectorFieldsKey(prefix, campaignId, redirectorId))
        parser.pushKey(redirectorIndexKey(prefix, campaignId))

        parser.push(lockSecret)
      },

      transformReply: undefined as unknown as () => unknown,
    },
  },
} as const
