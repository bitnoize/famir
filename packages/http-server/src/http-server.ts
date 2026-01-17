//import { HttpPlainText, HttpQueryString } from '@famir/domain'

export interface HttpServerConfig {
  HTTP_SERVER_ADDRESS: string
  HTTP_SERVER_PORT: number
  HTTP_SERVER_ERROR_PAGE: string
}

export interface HttpServerOptions {
  address: string
  port: number
  errorPage: string
}

//export type QueryStringWrapper = (query: HttpQueryString) => void
//export type PlainTextWrapper = (text: HttpPlainText) => void
//export type JsonWrapper = (json: object) => void
//export type HtmlWrapper = (cheerioAPI: CheerioAPI) => void
