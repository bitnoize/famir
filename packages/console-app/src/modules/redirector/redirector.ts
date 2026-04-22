/**
 * @category Redirector
 * @internal
 */
export const REDIRECTOR_CONTROLLER = Symbol('RedirectorController')

/**
 * @category Redirector
 * @internal
 */
export const REDIRECTOR_SERVICE = Symbol('RedirectorService')

/**
 * @category Redirector
 */
export interface CreateRedirectorData {
  campaignId: string
  redirectorId: string
  page: string
  lockSecret: string
}

/**
 * @category Redirector
 */
export interface ReadRedirectorData {
  campaignId: string
  redirectorId: string
}

/**
 * @category Redirector
 */
export interface UpdateRedirectorData {
  campaignId: string
  redirectorId: string
  page: string | null | undefined
  lockSecret: string
}

/**
 * @category Redirector
 */
export interface ActionRedirectorFieldData {
  campaignId: string
  redirectorId: string
  field: string
  lockSecret: string
}

/**
 * @category Redirector
 */
export interface DeleteRedirectorData {
  campaignId: string
  redirectorId: string
  lockSecret: string
}

/**
 * @category Redirector
 */
export interface ListRedirectorsData {
  campaignId: string
}
