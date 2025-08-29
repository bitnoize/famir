export interface RawMessage {
  id: string
  proxy_id: string
  target_id: string
  session_id: string
  client_ip: string
  method: string
  origin_url: string
  forward_url: string
  request_headers: unknown
  request_cookies: unknown
  request_body: string
  status_code: number
  response_headers: unknown
  response_cookies: unknown
  response_body: string
  query_time: number
  score: number
  is_complete: boolean
  created_at: number
  updated_at: number
}
