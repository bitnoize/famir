export interface HttpClientRequest {
  proxy: string
  method: string
  url: string
  headers: Record<string, string | string[]>
  body: Buffer
  connectTimeout: number
  timeout: number
}

export interface HttpClientResponse {
  statusCode: number
  headers: Record<string, string | string[]>
  body: Buffer
  totalTime: number
  error?: unknown
}

export interface HttpClient {
  forward(request: HttpClientRequest): Promise<HttpClientResponse>
}

export const HTTP_CLIENT = Symbol('HttpClient')
