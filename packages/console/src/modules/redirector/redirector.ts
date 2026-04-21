export const REDIRECTOR_CONTROLLER = Symbol('RedirectorController')

/**
 * @category DI
 */
export const REDIRECTOR_SERVICE = Symbol('RedirectorService')

/**
 * @category Data
 */
export interface CreateRedirectorData {
  campaignId: string
  redirectorId: string
  page: string
  lockSecret: string
}

/**
 * @category Data
 */
export interface ReadRedirectorData {
  campaignId: string
  redirectorId: string
}

/**
 * @category Data
 */
export interface UpdateRedirectorData {
  campaignId: string
  redirectorId: string
  page: string | null | undefined
  lockSecret: string
}

/**
 * @category Data
 */
export interface ActionRedirectorFieldData {
  campaignId: string
  redirectorId: string
  field: string
  lockSecret: string
}

/**
 * @category Data
 */
export interface DeleteRedirectorData {
  campaignId: string
  redirectorId: string
  lockSecret: string
}

/**
 * @category Data
 */
export interface ListRedirectorsData {
  campaignId: string
}
