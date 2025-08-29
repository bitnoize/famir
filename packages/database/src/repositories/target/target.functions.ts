import { CommandParser } from '@redis/client'
import {
  campaignKey,
  targetIndexKey,
  targetKey,
  targetUniqueDonorKey,
  targetUniqueMirrorKey
} from '../../database.keys.js'

export interface RawTarget {
  id: string
  is_landing: number
  donor_secure: number
  donor_sub: string
  donor_domain: string
  donor_port: number
  mirror_secure: number
  mirror_sub: string
  mirror_domain: string
  mirror_port: number
  main_page: string
  not_found_page: string
  favicon_ico: string
  robots_txt: string
  sitemap_xml: string
  success_redirect_url: string
  failure_redirect_url: string
  is_enabled: number
  total_count: number
  success_count: number
  failure_count: number
  created_at: number
  updated_at: number
}

export const targetFunctions = {
  target: {
    create_target: {
      NUMBER_OF_KEYS: 5,

      parseCommand(
        parser: CommandParser,
        id: string,
        is_landing: boolean,
        donor_secure: boolean,
        donor_sub: string,
        donor_domain: string,
        donor_port: number,
        mirror_secure: boolean,
        mirror_sub: string,
        mirror_domain: string,
        mirror_port: number,
        main_page: string,
        not_found_page: string,
        favicon_ico: string,
        robots_txt: string,
        sitemap_xml: string,
        success_redirect_url: string,
        failure_redirect_url: string
      ) {
        parser.pushKey(campaignKey())
        parser.pushKey(targetKey(id))
        parser.pushKey(targetUniqueDonorKey())
        parser.pushKey(targetUniqueMirrorKey())
        parser.pushKey(targetIndexKey())

        parser.push(id)
        parser.push(is_landing ? '1' : '0')
        parser.push(donor_secure ? '1' : '0')
        parser.push(donor_sub)
        parser.push(donor_domain)
        parser.push(donor_port.toString())
        parser.push(mirror_secure ? '1' : '0')
        parser.push(mirror_sub)
        parser.push(mirror_domain)
        parser.push(mirror_port.toString())
        parser.push(main_page)
        parser.push(not_found_page)
        parser.push(favicon_ico)
        parser.push(robots_txt)
        parser.push(sitemap_xml)
        parser.push(success_redirect_url)
        parser.push(failure_redirect_url)
        parser.push(Date.now().toString())
      },

      transformReply: undefined as unknown as () => string
    },

    read_target: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, id: string) {
        parser.pushKey(campaignKey())
        parser.pushKey(targetKey(id))
      },

      transformReply: undefined as unknown as () => RawTarget | null
    },

    read_target_index: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser) {
        parser.pushKey(campaignKey())
        parser.pushKey(targetIndexKey())
      },

      transformReply: undefined as unknown as () => string[] | null
    },

    update_target: {
      NUMBER_OF_KEYS: 2,

      parseCommand(
        parser: CommandParser,
        id: string,
        main_page: string | null | undefined,
        not_found_page: string | null | undefined,
        favicon_ico: string | null | undefined,
        robots_txt: string | null | undefined,
        sitemap_xml: string | null | undefined,
        success_redirect_url: string | null | undefined,
        failure_redirect_url: string | null | undefined
      ) {
        parser.pushKey(campaignKey())
        parser.pushKey(targetKey(id))

        if (main_page != null) {
          parser.push('main_page')
          parser.push(main_page)
        }

        if (not_found_page != null) {
          parser.push('not_found_page')
          parser.push(not_found_page)
        }

        if (favicon_ico != null) {
          parser.push('favicon_ico')
          parser.push(favicon_ico)
        }

        if (robots_txt != null) {
          parser.push('robots_txt')
          parser.push(robots_txt)
        }

        if (sitemap_xml != null) {
          parser.push('sitemap_xml')
          parser.push(sitemap_xml)
        }

        if (success_redirect_url != null) {
          parser.push('success_redirect_url')
          parser.push(success_redirect_url)
        }

        if (failure_redirect_url != null) {
          parser.push('failure_redirect_url')
          parser.push(failure_redirect_url)
        }

        parser.push('updated_at')
        parser.push(Date.now().toString())
      },

      transformReply: undefined as unknown as () => string
    },

    enable_target: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, id: string) {
        parser.pushKey(campaignKey())
        parser.pushKey(targetKey(id))

        parser.push(Date.now().toString())
      },

      transformReply: undefined as unknown as () => string
    },

    disable_target: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, id: string) {
        parser.pushKey(campaignKey())
        parser.pushKey(targetKey(id))

        parser.push(Date.now().toString())
      },

      transformReply: undefined as unknown as () => string
    },

    delete_target: {
      NUMBER_OF_KEYS: 5,

      parseCommand(parser: CommandParser, id: string) {
        parser.pushKey(campaignKey())
        parser.pushKey(targetKey(id))
        parser.pushKey(targetUniqueDonorKey())
        parser.pushKey(targetUniqueMirrorKey())
        parser.pushKey(targetIndexKey())
      },

      transformReply: undefined as unknown as () => string
    }
  }
} as const
