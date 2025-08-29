export interface DatabaseConfig {
  DATABASE_CONNECTION_URL: string
}

export interface DatabaseOptions {
  connectionUrl: string
}

export interface DatabaseConnector {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
  connection<T>(): T
  connect(): Promise<void>
  close(): Promise<void>
}
