export interface DatabaseConfig {
  DATABASE_CONNECTION_URL: string
  DATABASE_PREFIX: string
}

export interface DatabaseConnectorOptions {
  connectionUrl: string
}

export interface DatabaseRepositoryOptions {
  prefix: string
}
