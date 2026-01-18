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
