import { HttpServerConfig, HttpServerOptions } from './http-server.js'

export function buildOptions(data: HttpServerConfig): HttpServerOptions {
  return {
    address: data.HTTP_SERVER_ADDRESS,
    port: data.HTTP_SERVER_PORT,
    bodyLimit: data.HTTP_SERVER_BODY_LIMIT,
    errorPage: data.HTTP_SERVER_ERROR_PAGE
  }
}

export const DEFAULT_ERROR_PAGE = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Error</title>
  </head>
  <body>
    <div>
      <h1><%= data.status %></h1>
      <p><%= data.message %></p>
    </div>
  </body>
</html>`
