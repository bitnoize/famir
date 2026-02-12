export const DATABASE_STATUS_CODES = ['OK', 'NOT_FOUND', 'CONFLICT', 'FORBIDDEN'] as const
export type DatabaseStatusCode = (typeof DATABASE_STATUS_CODES)[number]

export interface RedisDatabaseConfig {
  DATABASE_CONNECTION_URL: string
  DATABASE_PREFIX: string
}

export interface RedisDatabaseConnectorOptions {
  connectionUrl: string
}

export interface RedisDatabaseRepositoryOptions {
  prefix: string
}
