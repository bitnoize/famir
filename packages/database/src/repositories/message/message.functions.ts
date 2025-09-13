import {
  MessageHeaders,
  MessageMethod,
  MessageRequestCookies,
  MessageResponseCookies
} from '@famir/domain'
import { CommandParser } from '@redis/client'
import { campaignKey, messageKey, proxyKey, sessionKey, targetKey } from '../../database.keys.js'

export interface RawMessage {
  campaign_id: string
  id: string
  proxy_id: string
  target_id: string
  session_id: string
  client_ip: string
  method: string
  origin_url: string
  forward_url: string
  request_headers: unknown
  request_cookies: unknown
  request_body: string
  status_code: number
  response_headers: unknown
  response_cookies: unknown
  response_body: string
  query_time: number
  score: number
  created_at: number
}

export const messageFunctions = {
  message: {
    create_message: {
      NUMBER_OF_KEYS: 5,

      parseCommand(
        parser: CommandParser,
        campaignId: string,
        id: string,
        proxyId: string,
        targetId: string,
        sessionId: string,
        clientIp: string,
        method: MessageMethod,
        originUrl: string,
        forwardUrl: string,
        requestHeaders: MessageHeaders,
        requestCookies: MessageRequestCookies,
        requestBody: Buffer,
        statusCode: number,
        responseHeaders: MessageHeaders,
        responseCookies: MessageResponseCookies,
        responseBody: Buffer,
        queryTime: number,
        score: number
      ) {
        parser.pushKey(campaignKey(campaignId))
        parser.pushKey(messageKey(campaignId, id))
        parser.pushKey(proxyKey(campaignId, id))
        parser.pushKey(targetKey(campaignId, id))
        parser.pushKey(sessionKey(campaignId, id))

        parser.push(campaignId)
        parser.push(id)
        parser.push(proxyId)
        parser.push(targetId)
        parser.push(sessionId)
        parser.push(clientIp)
        parser.push(method)
        parser.push(originUrl)
        parser.push(forwardUrl)
        parser.push(JSON.stringify(requestHeaders))
        parser.push(JSON.stringify(requestCookies))
        parser.push(requestBody.toString('base64'))
        parser.push(statusCode.toString())
        parser.push(JSON.stringify(responseHeaders))
        parser.push(JSON.stringify(responseCookies))
        parser.push(responseBody.toString('base64'))
        parser.push(queryTime.toString())
        parser.push(score.toString())
        parser.push(Date.now().toString())
      },

      transformReply: undefined as unknown as () => string
    },

    read_message: {
      NUMBER_OF_KEYS: 2,

      parseCommand(parser: CommandParser, campaignId: string, id: string) {
        parser.pushKey(campaignKey(campaignId))
        parser.pushKey(messageKey(campaignId, id))
      },

      transformReply: undefined as unknown as () => RawMessage | null
    }
  }
} as const
