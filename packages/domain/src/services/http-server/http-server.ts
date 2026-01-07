export const HTTP_SERVER = Symbol('HttpServer')

export interface HttpServer {
  listen(): Promise<void>
  close(): Promise<void>
}
