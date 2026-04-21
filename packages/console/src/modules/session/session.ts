export const SESSION_CONTROLLER = Symbol('SessionController')

/**
 * @category DI
 */
export const SESSION_SERVICE = Symbol('SessionService')

/**
 * @category Data
 */
export interface CreateSessionData {
  campaignId: string
}

/**
 * @category Data
 */
export interface ReadSessionData {
  campaignId: string
  sessionId: string
}

/**
 * @category Data
 */
export interface AuthSessionData {
  campaignId: string
  sessionId: string
}

/**
 * @category Data
 */
export interface UpgradeSessionData {
  campaignId: string
  lureId: string
  sessionId: string
  secret: string
}
