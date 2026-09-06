/**
 * Available values for the target access levels.
 *
 * @category Target Repository
 * @internal
 */
export const TARGET_ACCESS_LEVELS = ['transparent', 'landing'] as const

/**
 * Type of access level to the target.
 *
 * @category Target Repository
 */
export type TargetAccessLevel = (typeof TARGET_ACCESS_LEVELS)[number]

/**
 * Special value for the apex (root) subdomain.
 *
 * @category Target Repository
 * @internal
 */
export const TARGET_SUB_APEX = '@'

/**
 * Tuple containing a campaign ID and a target ID.
 *
 * @category Target Repository
 */
export type TargetLink = [string, string]

/**
 * Dictionary mapping mirror hostnames to target links.
 *
 * @category Target Repository
 */
export type TargetHosts = Record<string, TargetLink>
