/**
 * @category Session
 * @internal
 */
export const SESSION_CONTROLLER = Symbol('SessionController')

/**
 * @category Session
 * @internal
 */
export const SESSION_SERVICE = Symbol('SessionService')

/**
 * @category Session
 */
export interface CreateSessionData {
  campaignId: string
}

/**
 * @category Session
 */
export interface ReadSessionData {
  campaignId: string
  sessionId: string
}

/**
 * @category Session
 */
export interface AuthSessionData {
  campaignId: string
  sessionId: string
}

/**
 * @category Session
 */
export interface UpgradeSessionData {
  campaignId: string
  lureId: string
  sessionId: string
  secret: string
}
