/**
 * Parameters for upgrading a session.
 *
 * @category Session Repository
 */
export interface UpgradeSessionParams {
  lure_id: string
  session_id: string
  secret: string
  back_url: string
}
