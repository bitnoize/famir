/**
 * Arguments for creating a redirector.
 *
 * @category Redirector
 * @internal
 */
export interface CreateRedirectorArgs {
  _: [string, string]
  pageFile: string | null | undefined
  lockSecret: string
}

/**
 * Arguments for reading the redirector.
 *
 * @category Redirector
 * @internal
 */
export interface ReadRedirectorArgs {
  _: [string, string]
}

/**
 * Arguments for updating the redirector.
 *
 * @category Redirector
 * @internal
 */
export interface UpdateRedirectorArgs {
  _: [string, string]
  pageFile: string | null | undefined
  lockSecret: string
}

/**
 * Arguments for altering the redirector field.
 *
 * @category Redirector
 * @internal
 */
export interface AlterRedirectorFieldArgs {
  _: [string, string]
  field: string
  lockSecret: string
}

/**
 * Arguments for deleting the redirector.
 *
 * @category Redirector
 * @internal
 */
export interface DeleteRedirectorArgs {
  _: [string, string]
  lockSecret: string
}

/**
 * Arguments for listing redirectors.
 *
 * @category Redirector
 * @internal
 */
export interface ListRedirectorsArgs {
  _: [string]
}
