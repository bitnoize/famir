export interface HttpClientConfig {
  HTTP_CLIENT_BODY_LIMIT: number
}

export interface HttpClientOptions {
  bodyLimit: number
}

export interface ForwardRequest {
  proxy: string
  method: string
  url: string
  headers: Record<string, string | string[]>
  body: Buffer
  connectTimeout: number
  timeout: number
}

export interface ForwardResponse {
  statusCode: number
  headers: Record<string, string | string[]>
  body: Buffer
  totalTime: number
  error?: unknown
}

export interface HttpClient {
  forward(request: ForwardRequest): Promise<ForwardResponse>
}
