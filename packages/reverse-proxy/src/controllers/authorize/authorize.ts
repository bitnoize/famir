export interface LandingUpgradeData {
  lureId: string
  secret: string
}

export interface LandingRedirectorData {
  title: string
  description: string
  image: string
  url: string
}

export interface ReadProxyData {
  campaignId: string
  proxyId: string
}

export interface ReadRedirectorData {
  campaignId: string
  redirectorId: string
}

export interface ReadLurePathData {
  campaignId: string
  path: string
}

export interface CreateSessionData {
  campaignId: string
}

export interface AuthSessionData {
  campaignId: string
  sessionId: string
}

export interface UpgradeSessionData {
  campaignId: string
  lureId: string
  sessionId: string
  secret: string
}
