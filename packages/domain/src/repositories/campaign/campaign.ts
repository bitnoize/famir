/**
 * Time for which a campaign is blocked in milliseconds.
 *
 * @category Campaign Repository
 * @internal
 */
export const CAMPAIGN_LOCK_TIMEOUT = 5 * 60 * 1000

/**
 * Represents campaign limiter.
 *
 * @category Campaign Repository
 */
export interface CampaignLimiter {
  isAllowed: boolean
  tokens: number
  ts: number
  cost: number
  retryAfterMs: number
}
