import { ProxyModel, SessionModel } from '@famir/domain'

export interface LandingAuthData {
  lureId: string
  sessionId: string
  sessionSecret: string
}

export interface CreateSessionData {
  campaignId: string
}

export interface CreateSessionReply {
  proxy: ProxyModel
  session: SessionModel
}
