import { MessageHeaders, MessageRequestCookies, MessageResponseCookies } from '@famir/domain'
import { CommandParser } from '@redis/client'
import { campaignKey, messageKey, proxyKey, sessionKey, targetKey } from '../../database.keys.js'

export interface RawMessage {
  campaign_id: string
  message_id: string
  proxy_id: string
  target_id: string
  session_id: string
  client_ip: string
  method: string
  origin_url: string
  forward_url: string
  request_headers: string
  request_cookies: string
  request_body: string
  status: number
  response_headers: string
  response_cookies: string
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
        prefix: string,
        campaignId: string,
        messageId: string,
        proxyId: string,
        targetId: string,
        sessionId: string,
        clientIp: string,
        method: string,
        originUrl: string,
        forwardUrl: string,
        requestHeaders: MessageHeaders,
        requestCookies: MessageRequestCookies,
        requestBody: Buffer,
        status: number,
        responseHeaders: MessageHeaders,
        responseCookies: MessageResponseCookies,
        responseBody: Buffer,
        queryTime: number,
        score: number
      ) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(messageKey(prefix, campaignId, messageId))
        parser.pushKey(proxyKey(prefix, campaignId, messageId))
        parser.pushKey(targetKey(prefix, campaignId, messageId))
        parser.pushKey(sessionKey(prefix, campaignId, messageId))

        parser.push(campaignId)
        parser.push(messageId)
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
        parser.push(status.toString())
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

      parseCommand(parser: CommandParser, prefix: string, campaignId: string, messageId: string) {
        parser.pushKey(campaignKey(prefix, campaignId))
        parser.pushKey(messageKey(prefix, campaignId, messageId))
      },

      transformReply: undefined as unknown as () => RawMessage | null
    }
  }
} as const
