export const AUTH_SESSION_USE_CASE = Symbol('AuthSessionUseCase')

export interface AuthSessionData {
  campaignId: string
  sessionId: string
}
