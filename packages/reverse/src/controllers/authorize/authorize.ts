export const AUTHORIZE_CONTROLLER = Symbol('AuthorizeController')

export interface LandingUpgradePayload {
  lure_id: string
  session_id: string
  secret: string
  back_url: string
}

export type LandingLurePayload = Record<string, string>
