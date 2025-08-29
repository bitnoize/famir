export interface Session {
  id: string
  proxyId: string
  secret: string
  isLanding: boolean
  totalCount: number
  successCount: number
  failureCount: number
  createdAt: number
  updatedAt: number
}
