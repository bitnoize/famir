import { CommandParser } from '@redis/client'
import {
  campaignKey,
  targetIndexKey,
  targetKey,
  targetUniqueDonorKey,
  targetUniqueMirrorKey
} from '../../database.keys.js'

export interface RawTarget {
  campaign_id: string
  target_id: string
  is_landing: number
  donor_secure: number
  donor_sub: string
  donor_domain: string
  donor_port: number
  mirror_secure: number
  mirror_sub: string
  mirror_port: number
  marks: string
  connect_timeout: number
  timeout: number
  main_page: string
  not_found_page: string
  favicon_ico: string
  robots_txt: string
  sitemap_xml: string
  success_redirect_url: string
  failure_redirect_url: string
  is_enabled: number
  message_count: number
  created_at: number
  updated_at: number
}

export const targetFunctions = {
  target: {
    create_target: {
      NUMBER_OF_KEYS: 5,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        targetId: string,
        isLanding: boolean,
        donorSecure: boolean,
        donorSub: string,
        donorDomain: string,
        donorPort: number,
        mirrorSecure: boolean,
        mirrorSub: string,
        mirrorPort: number,
        marks: string[],
        connectTimeout: number,
        timeout: number,
        mainPage: string,
        notFoundPage: string,
        faviconIco: string,
        robotsTxt: string,
        sitemapXml: string,
        successRedirectUrl: string,
        failureRedirectUrl: string
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(targetKey(prefix, campaignId, targetId))
        parser.pushKey(targetUniqueDonorKey(prefix, campaignId))
        parser.pushKey(targetUniqueMirrorKey(prefix, campaignId))
        parser.pushKey(targetIndexKey(prefix, campaignId))

        parser.push(campaignId)
        parser.push(targetId)
        parser.push(isLanding ? '1' : '0')
        parser.push(donorSecure ? '1' : '0')
        parser.push(donorSub)
        parser.push(donorDomain)
        parser.push(donorPort.toString())
        parser.push(mirrorSecure ? '1' : '0')
        parser.push(mirrorSub)
        parser.push(mirrorPort.toString())
        parser.push(marks.join(' '))
        parser.push(connectTimeout.toString())
        parser.push(timeout.toString())
        parser.push(mainPage)
        parser.push(notFoundPage)
        parser.push(faviconIco)
        parser.push(robotsTxt)
        parser.push(sitemapXml)
        parser.push(successRedirectUrl)
        parser.push(failureRedirectUrl)
        parser.push(Date.now().toString())
      },

      transformReply: undefined as unknown as () => string
    },

    read_target: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string, targetId: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(targetKey(prefix, campaignId, targetId))
      },

      transformReply: undefined as unknown as () => RawTarget | null
    },

    read_target_index: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(targetIndexKey(prefix, campaignId))
      },

      transformReply: undefined as unknown as () => string[] | null
    },

    update_target: {
      NUMBER_OF_KEYS: 2,

      parseCommand(
        parser: CommandParser,
        prefix: string,
        campaignId: string,
        targetId: string,
        marks: string[] | null | undefined,
        connectTimeout: number | null | undefined,
        timeout: number | null | undefined,
        mainPage: string | null | undefined,
        notFoundPage: string | null | undefined,
        faviconIco: string | null | undefined,
        robotsTxt: string | null | undefined,
        sitemapXml: string | null | undefined,
        successRedirectUrl: string | null | undefined,
        failureRedirectUrl: string | null | undefined
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(targetKey(prefix, campaignId, targetId))

        if (marks != null) {
          parser.push('marks')
          parser.push(marks.join(' '))
        }

        if (connectTimeout != null) {
          parser.push('connect_timeout')
          parser.push(connectTimeout.toString())
        }

        if (timeout != null) {
          parser.push('timeout')
          parser.push(timeout.toString())
        }

        if (mainPage != null) {
          parser.push('main_page')
          parser.push(mainPage)
        }

        if (notFoundPage != null) {
          parser.push('not_found_page')
          parser.push(notFoundPage)
        }

        if (faviconIco != null) {
          parser.push('favicon_ico')
          parser.push(faviconIco)
        }

        if (robotsTxt != null) {
          parser.push('robots_txt')
          parser.push(robotsTxt)
        }

        if (sitemapXml != null) {
          parser.push('sitemap_xml')
          parser.push(sitemapXml)
        }

        if (successRedirectUrl != null) {
          parser.push('success_redirect_url')
          parser.push(successRedirectUrl)
        }

        if (failureRedirectUrl != null) {
          parser.push('failure_redirect_url')
          parser.push(failureRedirectUrl)
        }

        parser.push('updated_at')
        parser.push(Date.now().toString())
      },

      transformReply: undefined as unknown as () => string
    },

    enable_target: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string, targetId: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(targetKey(prefix, campaignId, targetId))

        parser.push(Date.now().toString())
      },

      transformReply: undefined as unknown as () => string
    },

    disable_target: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string, targetId: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(targetKey(prefix, campaignId, targetId))

        parser.push(Date.now().toString())
      },

      transformReply: undefined as unknown as () => string
    },

    delete_target: {
      NUMBER_OF_KEYS: 5,

      parseCommand(parser: CommandParser, prefix: string, campaignId: string, targetId: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(targetKey(prefix, campaignId, targetId))
        parser.pushKey(targetUniqueDonorKey(prefix, campaignId))
        parser.pushKey(targetUniqueMirrorKey(prefix, campaignId))
        parser.pushKey(targetIndexKey(prefix, campaignId))
      },

      transformReply: undefined as unknown as () => string
    }
  }
} as const
