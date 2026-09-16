/**
 * @category Session
 * @internal
 */
export interface ReadSessionArgs {
  _: [string, string]
}

/**
 * @category Session
 * @internal
 */
export interface RevokeSessionArgs {
  _: [string, string]
}

/**
 * @category Session
 * @internal
 */
export interface ListSessionsArgs {
  _: [string]
  limit: number
}
