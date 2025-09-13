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

export interface DatabaseConnector {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  connection<T>(): T
  connect(): Promise<void>
  close(): Promise<void>
}
