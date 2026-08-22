/**
 * Arguments for reading the target.
 *
 * @category Target
 * @internal
 */
export interface ReadTargetArgs {
  _: [string, string]
}

/**
 * Arguments for reading the target hosts.
 *
 * @category Target
 * @internal
 */
export interface ReadTargetHostsArgs {
  _: string[]
}

/**
 * Arguments for listing targets.
 *
 * @category Target
 * @internal
 */
export interface ListTargetsArgs {
  _: [string]
}
