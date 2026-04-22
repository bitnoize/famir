/**
 * @category Message
 * @internal
 */
export const MESSAGE_CONTROLLER = Symbol('MessageController')

/**
 * @category Message
 * @internal
 */
export const MESSAGE_SERVICE = Symbol('MessageService')

/**
 * @category Message
 */
export interface ReadMessageData {
  campaignId: string
  messageId: string
}
