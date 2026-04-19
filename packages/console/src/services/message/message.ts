/**
 * @category DI
 */
export const MESSAGE_SERVICE = Symbol('MessageService')

/**
 * @category Data
 */
export interface ReadMessageData {
  campaignId: string
  messageId: string
}
